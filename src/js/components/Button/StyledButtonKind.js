import styled, { css } from 'styled-components';

import {
  activeStyle,
  disabledStyle,
  focusStyle,
  genericStyles,
  kindPartStyles,
  parseMetricToNum,
} from '../../utils';
import { defaultProps } from '../../default-props';

const radiusStyle = props => {
  const size = props.sizeProp;
  if (size && props.theme.button.size && props.theme.button.size[size])
    return css`
      border-radius: ${props.theme.button.size[size].border.radius};
    `;
  if (props.theme.button.border && props.theme.button.border.radius)
    return css`
      border-radius: ${props.theme.button.border.radius};
    `;
  return '';
};

const fontStyle = props => {
  const size = props.sizeProp || 'medium';
  const data = props.theme.text[size];
  return css`
    font-size: ${data.size};
    line-height: ${data.height};
  `;
};

const padFromTheme = (size, theme) => {
  if (
    size &&
    theme.button.size &&
    theme.button.size[size] &&
    theme.button.size[size].pad
  ) {
    return {
      vertical: theme.button.size[size].pad.vertical,
      horizontal: theme.button.size[size].pad.horizontal,
    };
  }

  if (theme.button.padding) {
    return {
      vertical:
        theme.global.edgeSize[theme.button.padding.vertical] ||
        theme.button.padding.vertical,
      horizontal:
        theme.global.edgeSize[theme.button.padding.horizontal] ||
        theme.button.padding.horizontal,
    };
  }
  return undefined;
};

const padStyle = ({ sizeProp: size, theme }) => {
  const pad = padFromTheme(size, theme);
  return pad
    ? css`
        padding: ${pad.vertical} ${pad.horizontal};
      `
    : '';
};

// The > svg rule is to ensure Buttons with just an icon don't add additional
// vertical height internally.
const basicStyle = props => css`
  border: none;
  ${radiusStyle(props)};
  ${padStyle(props)}
  ${fontStyle(props)}

  > svg {
    vertical-align: bottom;
  }
`;

const getPath = (theme, path) => {
  let obj;
  if (path) {
    obj = theme;
    const parts = path.split('.');
    while (obj && parts.length) obj = obj[parts.shift()];
  }
  return obj;
};

const adjustPadStyle = (pad, width) => {
  const offset = parseMetricToNum(width);
  return css`
    padding: ${parseMetricToNum(pad.vertical) - offset}px
      ${parseMetricToNum(pad.horizontal) - offset}px;
  `;
};

// build up CSS from basic to specific based on the supplied sub-object paths
const kindStyle = ({ colorValue, sizeProp: size, themePaths, theme }) => {
  const styles = [];

  const pad = padFromTheme(size, theme);

  themePaths.base.forEach(themePath => {
    const obj = getPath(theme, `button.${themePath}`);

    if (obj) {
      styles.push(kindPartStyles(obj, theme, colorValue));
      if (obj.border && obj.border.width && pad && !obj.padding) {
        // Adjust padding from the button.size or just top button.padding
        // to deal with the kind's border width. But don't override any
        // padding in the kind itself for backward compatibility
        styles.push(adjustPadStyle(pad, obj.border.width));
      }
    }
  });

  themePaths.hover.forEach(themePath => {
    const obj = getPath(theme, `button.${themePath}`);

    if (obj) {
      const partStyles = kindPartStyles(obj, theme);
      let adjPadStyles = '';
      if (obj.border && obj.border.width && pad && !obj.padding) {
        // Adjust padding from the button.size or just top button.padding
        // to deal with the hover's border width. But don't override any
        // padding in the hover or hover.kind itself for backward compatibility
        adjPadStyles = adjustPadStyle(pad, obj.border.width);
      }
      if (partStyles.length > 0) {
        styles.push(
          css`
            &:hover {
              ${partStyles}
              ${adjPadStyles}
            }
          `,
        );
      }
    }
  });

  return styles;
};

const hoverIndicatorStyle = ({ hoverIndicator, theme }) => {
  const themishObj = {};
  if (hoverIndicator === true || hoverIndicator === 'background')
    themishObj.background = theme.global.hover.background;
  else themishObj.background = hoverIndicator;
  const styles = kindPartStyles(themishObj, theme);
  if (styles.length > 0)
    return css`
      &:hover {
        ${styles}
      }
    `;
  return '';
};

const fillStyle = fillContainer => {
  if (fillContainer === 'horizontal') {
    return 'width: 100%;';
  }
  if (fillContainer === 'vertical') {
    return 'height: 100%;';
  }
  if (fillContainer) {
    return `
      width: 100%;
      height: 100%;
      max-width: none;
      flex: 1 0 auto;
    `;
  }
  return undefined;
};

// The > svg rule is to ensure Buttons with just an icon don't add additional
// vertical height internally.
const plainStyle = () => css`
  outline: none;
  border: none;
  padding: 0;
  text-align: inherit;
  color: inherit;

  > svg {
    vertical-align: bottom;
  }
`;

const StyledButtonKind = styled.button.attrs(() => ({
  // don't let kind attribute leak to DOM
  kind: undefined,
}))`
  display: inline-block;
  box-sizing: border-box;
  cursor: pointer;
  font: inherit;
  text-decoration: none;
  margin: 0;
  background: transparent;
  overflow: visible;
  text-transform: none;

  ${genericStyles}
  ${props => props.plain && plainStyle(props)}
  // set baseline activeStyle for all buttons including plain buttons
  // buttons with kind will have active styling overridden by kindStyle
  // if they have specific state styles
  ${props => !props.disabled && props.active && activeStyle}
  ${props => !props.plain && basicStyle(props)}
  ${props => !props.plain && kindStyle(props)}
  ${props =>
    !props.plain &&
    props.align &&
    `
    text-align: ${props.align};
    `}
  ${props =>
    !props.disabled && props.hoverIndicator && hoverIndicatorStyle(props)}
  ${props =>
    props.disabled && disabledStyle(props.theme.button.disabled.opacity)}

  &:focus {
    ${props => (!props.plain || props.focusIndicator) && focusStyle()}
  }
  
  ${props =>
    !props.plain &&
    props.theme.button.transition &&
    `
    transition-property: ${props.theme.button.transition.properties.join(',')};
    transition-duration: ${props.theme.button.transition.duration}s;
    transition-timing-function: ${props.theme.button.transition.timing};
  `}
  ${props => props.fillContainer && fillStyle(props.fillContainer)}
  ${props => props.theme.button && props.theme.button.extend}
`;

StyledButtonKind.defaultProps = {};
Object.setPrototypeOf(StyledButtonKind.defaultProps, defaultProps);

export { StyledButtonKind };