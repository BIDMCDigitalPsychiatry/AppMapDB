import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { chainPropTypes } from '@material-ui/utils';
import { withStyles } from '@material-ui/core/styles';
import { capitalize } from '@material-ui/core/utils';
import Star from '@material-ui/icons/Star';

function getDecimalPrecision(num) {
  const decimalPart = num.toString().split('.')[1];
  return decimalPart ? decimalPart.length : 0;
}

function roundValueToPrecision(value, precision) {
  if (value == null) {
    return value;
  }

  const nearest = Math.round(value / precision) * precision;
  return Number(nearest.toFixed(getDecimalPrecision(precision)));
}

export const styles = theme => ({
  /* Styles applied to the root element. */
  root: {
    display: 'inline-flex',
    position: 'relative',
    fontSize: theme.typography.pxToRem(24),
    color: '#ffb400',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    '&$disabled': {
      opacity: 0.5,
      pointerEvents: 'none'
    }
    /*'&$focusVisible $iconActive': {
      outline: '1px solid #999'
    }*/
  },
  /* Styles applied to the root element if `size="small"`. */
  sizeSmall: {
    fontSize: theme.typography.pxToRem(18)
  },
  /* Styles applied to the root element if `size="large"`. */
  sizeLarge: {
    fontSize: theme.typography.pxToRem(30)
  },
  /* Styles applied to the root element if `readOnly={true}`. */
  readOnly: {
    pointerEvents: 'none'
  },
  /* Pseudo-class applied to the root element if `disabled={true}`. */
  disabled: {},
  /* Styles applied to the label elements. */
  label: {
    cursor: 'inherit'
  },
  /* Styles applied to the icon wrapping elements. */
  icon: {
    display: 'flex',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    }),
    // Fix mouseLeave issue.
    // https://github.com/facebook/react/issues/4492
    pointerEvents: 'none'
  },
  /* Styles applied to the icon wrapping elements when empty. */
  iconEmpty: {
    color: theme.palette.action.disabled
  },
  /* Styles applied to the icon wrapping elements when filled. */
  iconFilled: {},
  /* Styles applied to the icon wrapping elements when hover. */

  iconActive: {
    transform: 'scale(1.2)'
  },
  /* Styles applied to the icon wrapping elements when decimals are necessary. */
  decimal: {
    position: 'relative'
  }
});

function IconContainer(props) {
  const { value, ...other } = props;
  return <span {...other} />;
}

IconContainer.propTypes = {
  value: PropTypes.number.isRequired
};

const defaultIcon = <Star fontSize='inherit' />;

function defaultLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}`;
}

const Rating = props => {
  const {
    classes,
    className,
    defaultValue = null,
    disabled = false,
    emptyIcon,
    getLabelText = defaultLabelText,
    icon = defaultIcon,
    IconContainerComponent = IconContainer,
    max = 5,
    name: nameProp,
    precision = 1,
    readOnly = true,
    size = 'medium',
    value: valueProp,
    ...other
  } = props;

  const { current: isControlled } = React.useRef(valueProp !== undefined);
  const [valueState] = React.useState(defaultValue);
  const valueDerived = isControlled ? valueProp : valueState;

  const valueRounded = roundValueToPrecision(valueDerived, precision);
  const [{ hover, focus }] = React.useState({
    hover: -1,
    focus: -1
  });

  let value = valueRounded;

  const item = (state, labelProps) => {
    const container = (
      <IconContainerComponent
        value={state.value}
        className={clsx(classes.icon, {
          [classes.iconEmpty]: !state.filled,
          [classes.iconFilled]: state.filled,
          [classes.iconHover]: state.hover,
          [classes.iconFocus]: state.focus,
          [classes.iconActive]: state.active
        })}
      >
        {emptyIcon && !state.filled ? emptyIcon : icon}
      </IconContainerComponent>
    );

    return (
      <span key={state.value} {...labelProps}>
        {container}
      </span>
    );
  };

  return (
    <span
      className={clsx(
        classes.root,
        {
          [classes[`size${capitalize(size)}`]]: size !== 'medium',
          [classes.disabled]: disabled,
          [classes.readOnly]: readOnly
        },
        className
      )}
      role={readOnly ? 'img' : null}
      aria-label={readOnly ? getLabelText(value) : null}
      {...other}
    >
      {Array.from(new Array(max)).map((_, index) => {
        const itemValue = index + 1;

        if (precision < 1) {
          const items = Array.from(new Array(1 / precision));
          return (
            <span
              key={itemValue}
              className={clsx(classes.decimal, {
                [classes.iconActive]: itemValue === Math.ceil(value) && (hover !== -1 || focus !== -1)
              })}
            >
              {items.map(($, indexDecimal) => {
                const itemDecimalValue = roundValueToPrecision(itemValue - 1 + (indexDecimal + 1) * precision, precision);

                return item(
                  {
                    value: itemDecimalValue,
                    filled: itemDecimalValue <= value,
                    hover: itemDecimalValue <= hover,
                    focus: itemDecimalValue <= focus,
                    checked: itemDecimalValue === valueRounded
                  },
                  {
                    style:
                      items.length - 1 === indexDecimal
                        ? {}
                        : {
                            width: itemDecimalValue === value ? `${(indexDecimal + 1) * precision * 100}%` : '0%',
                            overflow: 'hidden',
                            zIndex: 1,
                            position: 'absolute'
                          }
                  }
                );
              })}
            </span>
          );
        }

        return item({
          value: itemValue,
          active: itemValue === value && (hover !== -1 || focus !== -1),
          filled: itemValue <= value,
          hover: itemValue <= hover,
          focus: itemValue <= focus,
          checked: itemValue === valueRounded
        });
      })}
    </span>
  );
};

Rating.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue: PropTypes.number,
  /**
   * If `true`, the rating will be disabled.
   */
  disabled: PropTypes.bool,
  /**
   * The icon to display when empty.
   */
  emptyIcon: PropTypes.node,
  /**
   * Accepts a function which returns a string value that provides a user-friendly name for the current value of the rating.
   *
   * For localization purposes, you can use the provided [translations](/guides/localization/).
   *
   * @param {number} value The rating label's value to format.
   * @returns {string}
   */
  getLabelText: PropTypes.func,
  /**
   * The icon to display.
   */
  icon: PropTypes.node,
  /**
   * The component containing the icon.
   */
  IconContainerComponent: PropTypes.elementType,
  /**
   * Maximum rating.
   */
  max: PropTypes.number,
  /**
   * The name attribute of the radio `input` elements.
   * If `readOnly` is false, the prop is required,
   * this input name`should be unique within the parent form.
   */
  name: chainPropTypes(PropTypes.string, props => {
    if (!props.readOnly && !props.name) {
      return new Error(
        ['Material-UI: the prop `name` is required (when `readOnly` is false).', 'Additionally, the input name should be unique within the parent form.'].join(
          '\n'
        )
      );
    }
    return null;
  }),
  /**
   * The minimum increment value change allowed.
   */
  precision: PropTypes.number,

  /**
   * The size of the rating.
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /**
   * The rating value.
   */
  value: PropTypes.number
};

export default withStyles(styles, { name: 'MuiRatingReadOnly' })(Rating);
