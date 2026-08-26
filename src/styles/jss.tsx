/*
 * JSS-compatible styling adapter over tss-react/emotion.
 *
 * @mui/styles (the deprecated JSS engine) is retired; the ~90 call sites keep
 * their familiar API — `makeStyles(theme => createStyles({...}))`, per-rule
 * prop functions (`root: props => ({...})`), `useStyles(props)`, and merging
 * of caller-supplied `props.classes` — but everything renders through
 * emotion, the same engine MUI v5 itself uses. New code should prefer `sx` /
 * `styled`; this adapter exists so the migration didn't require rewriting
 * every component by hand.
 */
import * as React from 'react';
import { makeStyles as tssMakeStyles } from 'tss-react/mui';

// JSS's createStyles was only ever a TypeScript identity helper.
export const createStyles = (styles: any) => styles;

export function makeStyles(stylesOrFn: any) {
  const useTss = tssMakeStyles<{ props: any }>()((theme, { props }) => {
    const styles = typeof stylesOrFn === 'function' ? stylesOrFn(theme) : stylesOrFn;
    const resolved: Record<string, any> = {};
    for (const key of Object.keys(styles)) {
      const value = styles[key];
      // JSS allowed each rule to be a function of the props passed to useStyles.
      resolved[key] = typeof value === 'function' ? value(props) : value;
    }
    return resolved;
  });

  return (props: any = {}): Record<string, string> => {
    const { classes, cx } = useTss({ props });
    const overrides = props && props.classes;
    if (!overrides) return classes as any;
    // JSS merged caller-supplied classes into the generated ones.
    const merged: Record<string, string> = { ...(classes as any) };
    for (const key of Object.keys(overrides)) merged[key] = cx((classes as any)[key], overrides[key]);
    return merged;
  };
}

export default makeStyles;

// JSS withStyles signature: withStyles(styles, options?)(Component) — injects
// the generated (and props-merged) classes as a `classes` prop.
export const withStyles = (styles: any, _options?: any) => (Component: any) => {
  const useStyles = makeStyles(styles);
  const Wrapped = React.forwardRef((props: any, ref: any) => {
    const classes = useStyles(props);
    return <Component ref={ref} {...props} classes={classes} />;
  });
  Wrapped.displayName = `WithStyles(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
};
