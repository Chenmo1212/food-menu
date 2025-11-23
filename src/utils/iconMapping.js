import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUtensils,
  faClock,
  faShoppingBag,
  faTrophy,
  faCog,
  faSearch,
  faFire,
  faShoppingCart,
  faStickyNote,
  faClipboardList,
  faPizzaSlice,
  faLock,
  faExclamationTriangle,
  faLightbulb,
  faHeart,
  faMedal,
  faPen,
  faTimes,
  faFlag,
  faGlobe,
  faPlus,
  faMinus,
  faCheck,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

// Icon mapping object for easy access
export const icons = {
  home: faHome,
  menu: faUtensils,
  clock: faClock,
  order: faShoppingBag,
  rank: faTrophy,
  settings: faCog,
  search: faSearch,
  fire: faFire,
  cart: faShoppingCart,
  note: faStickyNote,
  clipboard: faClipboardList,
  pizza: faPizzaSlice,
  lock: faLock,
  warning: faExclamationTriangle,
  lightbulb: faLightbulb,
  heart: faHeart,
  medal: faMedal,
  pen: faPen,
  times: faTimes,
  flag: faFlag,
  globe: faGlobe,
  plus: faPlus,
  minus: faMinus,
  check: faCheck,
  calendar: faCalendarAlt
};

// Reusable Icon component with consistent styling
export const Icon = ({ icon, className = '', size = '1x', ...props }) => {
  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={className}
      size={size}
      {...props}
    />
  );
};

// Specific icon components for common use cases
export const HomeIcon = (props) => <Icon icon={icons.home} {...props} />;
export const MenuIcon = (props) => <Icon icon={icons.menu} {...props} />;
export const ClockIcon = (props) => <Icon icon={icons.clock} {...props} />;
export const OrderIcon = (props) => <Icon icon={icons.order} {...props} />;
export const RankIcon = (props) => <Icon icon={icons.rank} {...props} />;
export const SettingsIcon = (props) => <Icon icon={icons.settings} {...props} />;
export const SearchIcon = (props) => <Icon icon={icons.search} {...props} />;
export const FireIcon = (props) => <Icon icon={icons.fire} {...props} />;
export const CartIcon = (props) => <Icon icon={icons.cart} {...props} />;
export const NoteIcon = (props) => <Icon icon={icons.note} {...props} />;
export const ClipboardIcon = (props) => <Icon icon={icons.clipboard} {...props} />;
export const PizzaIcon = (props) => <Icon icon={icons.pizza} {...props} />;
export const LockIcon = (props) => <Icon icon={icons.lock} {...props} />;
export const WarningIcon = (props) => <Icon icon={icons.warning} {...props} />;
export const LightbulbIcon = (props) => <Icon icon={icons.lightbulb} {...props} />;
export const HeartIcon = (props) => <Icon icon={icons.heart} {...props} />;
export const MedalIcon = (props) => <Icon icon={icons.medal} {...props} />;
export const PenIcon = (props) => <Icon icon={icons.pen} {...props} />;
export const TimesIcon = (props) => <Icon icon={icons.times} {...props} />;
export const FlagIcon = (props) => <Icon icon={icons.flag} {...props} />;
export const GlobeIcon = (props) => <Icon icon={icons.globe} {...props} />;
export const PlusIcon = (props) => <Icon icon={icons.plus} {...props} />;
export const MinusIcon = (props) => <Icon icon={icons.minus} {...props} />;
export const CheckIcon = (props) => <Icon icon={icons.check} {...props} />;
export const CalendarIcon = (props) => <Icon icon={icons.calendar} {...props} />;

// Made with Bob
