import * as React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { createStyles } from '../../styles/jss';
import { makeStyles } from '../../styles/jss';
import * as Icons from '@mui/icons-material';
import { TableVirtuoso } from 'react-virtuoso';
import { EditDialogButton } from '../application/GenericDialog/DialogButton';
import * as RateNewAppDialog from '../application/GenericDialog/RateNewApp/RateNewAppDialog';
import * as ApplicationHistoryDialog from '../application/GenericDialog/ApplicationHistoryDialog';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import { useSignedInRater } from '../../hooks';
import { useChangeRoute } from '../layout/hooks';
import { publicUrl } from '../../helpers';
import { getAppIcon } from '../application/GenericTable/Applications/selectors';
import { tables } from '../../database/dbConfig';
import {
  Platforms,
  Costs,
  DeveloperTypes,
  DeveloperTypeQuestions,
  Functionalities,
  FunctionalityQuestions,
  Privacies,
  PrivacyQuestions,
  ClinicalFoundations,
  ClinicalFoundationQuestions,
  TreatmentApproaches,
  Features,
  Conditions,
  Engagements,
  EngagementQuestions,
  Inputs,
  Outputs,
  Uses,
  withReplacement
} from '../../database/models/Application';
import { categories } from '../../constants';
import { useLastRatingDateTime } from '../application/GenericTable/ApplicationsGrid/useLastRatingDateTime';
import { useHandleTableReset } from '../application/GenericTable/store';

/*
 * Modern public replacement for the table view of the app library.
 *
 * Same information architecture as the legacy matrix — one slim column per
 * taxonomy value so a reader can scan straight down a value — but with a
 * two-row sticky header (category groups, then values), a pinned Application
 * column, checkmarks instead of radio icons, and ONE scroller for both axes
 * so nothing scrolls detached. The legacy matrix (with click-to-pin columns)
 * remains in admin mode as a curation tool; see Apps.tsx.
 */

// Zero-width space after slashes lets labels like 'References/Information'
// wrap at the slash instead of overflowing their narrow column.
const breakSlashes = (s: string) => String(s).replace(/\//g, '/​');

const shortLabel = (questions: any[] | undefined) => (label: string) => {
  const q = questions?.find(q => q.value === label);
  return q?.short ?? withReplacement(label);
};

type CategoryDef = { id: string; header?: string; field: string; values: string[]; questions?: any[] };

const CATEGORY_DEFS: CategoryDef[] = [
  { id: 'Platforms', field: 'platforms', values: Platforms as any },
  { id: 'DeveloperTypes', header: 'Developer Type', field: 'developerTypes', values: DeveloperTypes as any, questions: DeveloperTypeQuestions },
  { id: 'Cost', header: 'Cost', field: 'costs', values: Costs as any },
  { id: 'Functionalities', header: 'Access', field: 'functionalities', values: Functionalities as any, questions: FunctionalityQuestions },
  { id: 'Privacy', header: 'Privacy', field: 'privacies', values: Privacies as any, questions: PrivacyQuestions },
  {
    id: 'ClinicalFoundations',
    header: 'Clinical Foundations',
    field: 'clinicalFoundations',
    values: ClinicalFoundations as any,
    questions: ClinicalFoundationQuestions
  },
  { id: 'TreatmentApproaches', header: 'Treatment Approaches', field: 'treatmentApproaches', values: TreatmentApproaches as any },
  { id: 'Features', field: 'features', values: Features as any },
  { id: 'Conditions', header: 'Supported Conditions', field: 'conditions', values: Conditions as any },
  { id: 'Engagements', field: 'engagements', values: Engagements as any, questions: EngagementQuestions },
  { id: 'Inputs', field: 'inputs', values: Inputs as any },
  { id: 'Outputs', field: 'outputs', values: Outputs as any },
  { id: 'Uses', field: 'uses', values: Uses as any }
];

// Legacy data sometimes stores a question's `short` form instead of its value;
// match either, exactly (never by substring).
const hasValue = (tags: string[], value: string, short: string) => tags.includes(value) || (short !== value && tags.includes(short));

const APP_COL = 300;
const VALUE_COL = 84;
const DATE_COL = 130;
const ACTIONS_COL = 132;
const GROUP_HEADER_HEIGHT = 34;
const GROUP_ROW_TOTAL = GROUP_HEADER_HEIGHT + 2; // + the colored bottom border
const VALUE_HEADER_HEIGHT = 64;
const ROW_HEIGHT = 52;
const TOTAL_WIDTH = APP_COL + CATEGORY_DEFS.reduce((n, c) => n + c.values.length, 0) * VALUE_COL + DATE_COL + ACTIONS_COL;

const useStyles = makeStyles((theme: any) =>
  createStyles({
    outer: {
      background: theme.palette.common.white,
      border: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`,
      borderRadius: 12,
      margin: 8,
      overflow: 'hidden'
    },
    thBase: {
      background: theme.palette.grey[50],
      whiteSpace: 'nowrap',
      fontWeight: 700,
      color: theme.palette.text.secondary
    },
    // This react-virtuoso version does not pin the thead itself — each header
    // cell pins vertically on its own (row 2 offsets below row 1).
    thRow1: {
      position: 'sticky',
      top: 0,
      zIndex: 4
    },
    thRow2: {
      position: 'sticky',
      top: GROUP_ROW_TOTAL,
      zIndex: 4
    },
    thGroup: {
      height: GROUP_HEADER_HEIGHT,
      padding: '0 10px',
      fontSize: 13,
      textAlign: 'left',
      verticalAlign: 'middle',
      borderBottom: `2px solid ${theme.palette.divider ?? '#E5EAF0'}`
    },
    thValue: {
      height: VALUE_HEADER_HEIGHT,
      padding: '6px 6px',
      fontSize: 11,
      fontWeight: 600,
      lineHeight: 1.25,
      textAlign: 'center',
      verticalAlign: 'middle',
      whiteSpace: 'normal',
      overflowWrap: 'break-word',
      borderBottom: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`
    },
    thCorner: {
      textAlign: 'left',
      fontSize: 13,
      padding: '0 12px',
      verticalAlign: 'middle',
      borderBottom: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`,
      borderRight: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`
    },
    sortable: {
      cursor: 'pointer',
      userSelect: 'none',
      '&:hover': { color: theme.palette.text.primary }
    },
    td: {
      height: ROW_HEIGHT,
      padding: 0,
      textAlign: 'center',
      verticalAlign: 'middle',
      borderBottom: `1px solid ${theme.palette.grey[100]}`,
      background: theme.palette.common.white,
      cursor: 'pointer'
    },
    tdApp: {
      position: 'sticky',
      left: 0,
      zIndex: 1,
      textAlign: 'left',
      padding: '0 12px',
      borderRight: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`,
      overflow: 'hidden'
    },
    check: {
      fontSize: 18,
      color: theme.palette.primary.main,
      verticalAlign: 'middle'
    },
    dash: {
      color: theme.palette.grey[300],
      fontSize: 13
    },
    appIcon: {
      width: 36,
      height: 36,
      borderRadius: 9,
      border: `1px solid ${theme.palette.divider ?? '#E5EAF0'}`,
      objectFit: 'cover',
      backgroundColor: theme.palette.common.white,
      flexShrink: 0
    }
  })
);

const LastEvaluated = ({ created, updated }) => {
  const lastRating = useLastRatingDateTime({ created, updated });
  return (
    <Typography variant='caption' color='textSecondary' noWrap>
      {lastRating}
    </Typography>
  );
};

const stop = e => e.stopPropagation();

const RowActions = ({ app }) => {
  const signedInRater = useSignedInRater();
  const initialValues = { [tables.applications]: app };
  return (
    <Box onClick={stop} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
      <EditDialogButton
        variant='iconbutton'
        Module={ApplicationHistoryDialog}
        mount={false}
        Icon={Icons.History}
        initialValues={initialValues}
        tooltip='Ratings history'
        placement='bottom'
      />
      <EditDialogButton
        variant='iconbutton'
        Module={SuggestEditDialog}
        mount={false}
        Icon={Icons.OutlinedFlag}
        initialValues={initialValues}
        tooltip='Suggest an edit'
        placement='bottom'
      />
      {signedInRater && (
        <EditDialogButton
          variant='iconbutton'
          Module={RateNewAppDialog}
          mount={false}
          Icon={Icons.Edit}
          initialValues={initialValues}
          tooltip='Edit'
          placement='bottom'
        />
      )}
    </Box>
  );
};

type SortKey = 'name' | 'updated';

const VirtuosoTable = (props: any) => (
  <table {...props} style={{ ...props.style, width: TOTAL_WIDTH, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }} />
);

// Virtuoso renders the thead with zIndex 1 — the same as the body's sticky
// app-column cells, which come later in the DOM and therefore paint OVER the
// header. Lift the thead's stacking context above the body's sticky column.
const VirtuosoTableHead = React.forwardRef((props: any, ref: any) => <thead {...props} ref={ref} style={{ ...props.style, zIndex: 3 }} />);

export default function PublicApplicationsTable({ data = [], height = 500 }) {
  const classes = useStyles();
  const changeRoute = useChangeRoute();
  const handleReset = useHandleTableReset('Applications');
  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortAsc, setSortAsc] = React.useState(true);

  const handleSort = (key: SortKey) => () => {
    if (sortKey === key) setSortAsc(a => !a);
    else {
      setSortKey(key);
      setSortAsc(key === 'name'); // names A-Z, dates newest first
    }
  };

  const rows = React.useMemo(() => {
    const sorted = [...data].sort((a: any, b: any) => {
      if (sortKey === 'name') return String(a.name ?? '').localeCompare(String(b.name ?? ''));
      return (a.getValues()?.updated ?? a.created ?? 0) - (b.getValues()?.updated ?? b.created ?? 0);
    });
    return sortAsc ? sorted : sorted.reverse();
  }, [data, sortKey, sortAsc]);

  const SortIcon = ({ active }: { active: boolean }) =>
    active ? (
      sortAsc ? (
        <Icons.ArrowUpward sx={{ fontSize: 14, verticalAlign: 'text-bottom' }} />
      ) : (
        <Icons.ArrowDownward sx={{ fontSize: 14, verticalAlign: 'text-bottom' }} />
      )
    ) : null;

  const handleOpen = React.useCallback(
    (r: any) => () => {
      // ViewApp/ViewAppHeader expect the RAW Application record (tag arrays,
      // store links) — not the mapped table row, whose tag fields are
      // flattened search strings.
      const app = r.getValues ? r.getValues() : r;
      changeRoute(publicUrl('/ViewApp'), { app, from: 'ApplicationTable' });
    },
    [changeRoute]
  );

  if (rows.length === 0) {
    return (
      <div className={classes.outer} style={{ height }}>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 1 }}>
            No apps match your search
          </Typography>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
            Try removing a filter or changing your search text.
          </Typography>
          <Button variant='outlined' onClick={handleReset} sx={{ textTransform: 'none' }}>
            Clear all filters
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div className={classes.outer} style={{ height }}>
      <TableVirtuoso
        style={{ height: height - 2 }}
        data={rows}
        fixedItemHeight={ROW_HEIGHT}
        increaseViewportBy={{ top: 300, bottom: 300 }}
        components={{ Table: VirtuosoTable, TableHead: VirtuosoTableHead }}
        fixedHeaderContent={() => (
          <>
            {/* The pinned corner is split across the two header rows instead of
                using rowSpan — Chrome drops position:sticky on row-spanning
                cells, which un-froze the Application header. */}
            <tr>
              <th
                className={`${classes.thBase} ${classes.thCorner} ${classes.thRow1}`}
                style={{ width: APP_COL, left: 0, zIndex: 5, borderBottom: 'none' }}
              />
              {/* Last Evaluated + Details lead the taxonomy matrix: they're what
                  the app raters reach for most, and at the far right they were
                  a full horizontal scroll away. */}
              <th className={`${classes.thBase} ${classes.thCorner} ${classes.thRow1}`} style={{ width: DATE_COL, borderBottom: 'none' }} />
              <th className={`${classes.thBase} ${classes.thCorner} ${classes.thRow1}`} style={{ width: ACTIONS_COL, borderBottom: 'none' }} />
              {CATEGORY_DEFS.map(c => (
                <th
                  key={c.id}
                  colSpan={c.values.length}
                  className={`${classes.thBase} ${classes.thGroup} ${classes.thRow1}`}
                  style={{ borderBottomColor: categories[c.id]?.color ?? undefined, color: categories[c.id]?.color ?? undefined }}
                >
                  {c.header ?? c.id}
                </th>
              ))}
            </tr>
            <tr>
              <th
                className={`${classes.thBase} ${classes.thCorner} ${classes.sortable} ${classes.thRow2}`}
                style={{ width: APP_COL, left: 0, zIndex: 5, height: VALUE_HEADER_HEIGHT }}
                onClick={handleSort('name')}
              >
                Application <SortIcon active={sortKey === 'name'} />
              </th>
              <th
                className={`${classes.thBase} ${classes.thCorner} ${classes.sortable} ${classes.thRow2}`}
                style={{ width: DATE_COL }}
                onClick={handleSort('updated')}
              >
                Last Evaluated <SortIcon active={sortKey === 'updated'} />
              </th>
              <th className={`${classes.thBase} ${classes.thCorner} ${classes.thRow2}`} style={{ width: ACTIONS_COL }}>
                Details
              </th>
              {CATEGORY_DEFS.map(c =>
                c.values.map(v => (
                  <th key={`${c.id}-${v}`} className={`${classes.thBase} ${classes.thValue} ${classes.thRow2}`} style={{ width: VALUE_COL }}>
                    {breakSlashes(shortLabel(c.questions)(v))}
                  </th>
                ))
              )}
            </tr>
          </>
        )}
        itemContent={(index, r: any) => {
          const app = r.getValues ? r.getValues() : r;
          const open = handleOpen(r);
          return (
            <>
              <td className={`${classes.td} ${classes.tdApp}`} onClick={open}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <img className={classes.appIcon} src={getAppIcon(app)} alt='' />
                  <div style={{ minWidth: 0 }}>
                    <Typography variant='body2' noWrap style={{ fontWeight: 600 }}>
                      {r.name || 'Unknown Name'}
                    </Typography>
                    <Typography variant='caption' color='textSecondary' noWrap display='block'>
                      {r.company}
                    </Typography>
                  </div>
                </Box>
              </td>
              <td className={classes.td} onClick={open}>
                <LastEvaluated created={app.created} updated={app.updated} />
              </td>
              <td className={classes.td} style={{ cursor: 'default' }}>
                <RowActions app={app} />
              </td>
              {CATEGORY_DEFS.map(c => {
                const tags: string[] = Array.isArray(r.tags?.[c.field]) ? r.tags[c.field] : [];
                const toShort = shortLabel(c.questions);
                return c.values.map(v => (
                  <td key={`${c.id}-${v}`} className={classes.td} onClick={open}>
                    {hasValue(tags, v, toShort(v)) ? <Icons.Check className={classes.check} /> : <span className={classes.dash}>–</span>}
                  </td>
                ));
              })}
            </>
          );
        }}
      />
    </div>
  );
}
