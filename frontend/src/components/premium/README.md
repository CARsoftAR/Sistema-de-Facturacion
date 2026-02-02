# Premium UI Components

Biblioteca de componentes React premium para el Sistema de Facturación.

## 📦 Componentes Disponibles

### Layout
- `BentoCard` - Cards modulares con glassmorphism
- `BentoGrid` - Grid responsive
- `StatCard` (Bento) - Card para KPIs
- `ActionCard` - Card interactivo

### Forms
- `PremiumInput` - Input con validación
- `SearchInput` - Búsqueda con debounce
- `PremiumSelect` - Select estilizado

### Buttons
- `PremiumButton` - Botón principal
- `ButtonGroup` - Agrupación
- `IconButton` - Solo icono
- `FloatingActionButton` - FAB

### Tables
- `PremiumTable` - Tabla avanzada
- `TableCell` - Helpers de celdas

### Modals
- `PremiumModal` - Modal base
- `ConfirmModal` - Confirmación
- `AlertModal` - Alerta

### Statistics
- `StatCard` - Card de estadística
- `MiniStatCard` - Versión compacta
- `StatsGrid` - Grid para stats
- `ProgressCard` - Con progreso
- `ComparisonCard` - Comparación

## 🚀 Uso Rápido

```jsx
import {
    PremiumButton,
    PremiumInput,
    StatCard,
    PremiumTable
} from '@/components/premium';

// Usar componentes
<PremiumButton variant="primary" icon={Save}>
    Guardar
</PremiumButton>
```

## 📚 Documentación

Ver documentación completa en:
- `administrar/Standades para Antigravity/PREMIUM_COMPONENTS_GUIDE.md`
- `administrar/Standades para Antigravity/IMPLEMENTACION_PREMIUM.md`

## 🎨 Estilos

Importar estilos premium en tu archivo principal:

```jsx
import '@/styles/premium.css';
```

## 🔗 Ejemplos

- `pages/DashboardPremium.jsx` - Dashboard completo
- `pages/ShowcasePremium.jsx` - Galería de componentes
