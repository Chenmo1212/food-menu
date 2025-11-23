// Icon exports - Import SVG files as React components
import { ReactComponent as AllIcon } from './svgs/all.svg';
import { ReactComponent as PorkIcon } from './svgs/pork.svg';
import { ReactComponent as ChickenIcon } from './svgs/chicken.svg';
import { ReactComponent as SeafoodIcon } from './svgs/searfood.svg';
import { ReactComponent as VegetablesIcon } from './svgs/vegetables.svg';

// Export all icons
export {
  AllIcon,
  PorkIcon,
  ChickenIcon,
  SeafoodIcon,
  VegetablesIcon,
};

// Icon wrapper component for consistent styling
export const Icon = ({ component: Component, className = "w-6 h-6", ...props }) => {
  if (!Component) return null;
  return <Component className={className} {...props} />;
};

// Made with Bob
