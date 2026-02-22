/**
 * Premium UI Components Library
 * 
 * A comprehensive collection of premium React components
 * designed with modern UX principles and accessibility in mind.
 * 
 * Design System:
 * - Glassmorphism aesthetic
 * - 8px spacing grid
 * - Micro-animations
 * - WCAG 2.2 AA compliant
 * - Mobile-first responsive
 */

// Layout Components
export { BentoCard, BentoGrid, StatCard as BentoStatCard, ActionCard } from './BentoCard';

// Form Components
export { PremiumFilterBar } from './PremiumFilterBar';
export {
    PremiumInput,
    SearchInput,
    PremiumSelect
} from './PremiumInput';
export {
    PremiumInput as BasePremiumInput,
    SearchInput as BaseSearchInput,
    PremiumSelect as BasePremiumSelect
} from './PremiumInput';

// Button Components
export {
    PremiumButton,
    ButtonGroup,
    IconButton,
    FloatingActionButton
} from './PremiumButton';

// Table Components
export {
    PremiumTable,
    TableCell
} from './PremiumTable';

// Modal Components
export {
    PremiumModal,
    ConfirmModal,
    AlertModal
} from './PremiumModal';

// Statistics Components
export {
    StatCard,
    MiniStatCard,
    StatsGrid,
    ComparisonCard,
    ProgressCard
} from './PremiumStats';

// Chart Components
export { default as PremiumAreaChart } from './PremiumAreaChart';
