
import React from 'react';
import { GrillIcon, SaladIcon, DrinkIcon, DessertIcon } from './components/IconComponents';

export const ICON_MAP: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  'مشويات': GrillIcon,
  'سلطات': SaladIcon,
  'مشروبات': DrinkIcon,
  'حلويات': DessertIcon,
};
