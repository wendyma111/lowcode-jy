import ColorSetter from './text/color'
import FontSize from './text/font_size'
import FontWeight from './text/font_weight'
import LineHeight from './text/line_height'
import TextAlign from './text/text_align'

import BorderRadius from './border/border_radius'
import BorderColor from './border/border_color'
import BorderStyle from './border/border_style'
import BorderWidth from './border/border_width'

import ZIndex from './position/z_index'
import PositonType from './position/position_type'
import Float from './position/float'
import Clear from './position/clear'

import Background from './background/backgroung_color'

import Width from './layout/width'
import Height from './layout/height'
import Display from './layout/display'

import CustomStyle from './custom/style'

export default {
  text: [ColorSetter, FontSize, FontWeight, LineHeight, TextAlign],
  border: [BorderRadius, BorderColor, BorderStyle, BorderWidth],
  position: [ZIndex, PositonType, Float, Clear],
  background: [Background],
  layout: [Width, Height, Display],
  custom: [CustomStyle]
}