# Premium UI/UX Components - Sistema de Facturación

## 📚 Biblioteca de Componentes Premium

Esta biblioteca proporciona un conjunto completo de componentes React diseñados con principios modernos de UX y accesibilidad.

### 🎨 Principios de Diseño

1. **Glassmorphism**: Efectos de vidrio con blur para profundidad visual
2. **Grid de 8px**: Sistema de espaciado consistente
3. **Micro-animaciones**: Feedback táctil para mejor engagement
4. **WCAG 2.2 AA**: Cumplimiento de estándares de accesibilidad
5. **Mobile-first**: Diseño responsive desde el inicio

---

## 🧩 Componentes Disponibles

### Layout Components

#### **BentoCard**
Card modular con efectos premium.

```jsx
import { BentoCard } from '@/components/premium';

<BentoCard hover glass size="md">
  Contenido
</BentoCard>
```

**Props:**
- `hover` (boolean): Habilita efecto hover
- `glass` (boolean): Aplica efecto glassmorphism
- `size` ('sm' | 'md' | 'lg' | 'xl'): Tamaño del padding
- `onClick` (function): Handler de click

#### **BentoGrid**
Contenedor grid responsive para cards.

```jsx
import { BentoGrid } from '@/components/premium';

<BentoGrid cols={3}>
  <BentoCard>Card 1</BentoCard>
  <BentoCard>Card 2</BentoCard>
  <BentoCard>Card 3</BentoCard>
</BentoGrid>
```

---

### Form Components

#### **PremiumInput**
Input avanzado con validación y estados.

```jsx
import { PremiumInput } from '@/components/premium';

<PremiumInput
  label="Email"
  type="email"
  icon={Mail}
  error="Email inválido"
  clearable
/>
```

**Props:**
- `label` (string): Etiqueta del campo
- `error` (string): Mensaje de error
- `success` (string): Mensaje de éxito
- `hint` (string): Texto de ayuda
- `icon` (Component): Icono de Lucide
- `clearable` (boolean): Muestra botón limpiar

#### **SearchInput**
Input de búsqueda con debounce.

```jsx
import { SearchInput } from '@/components/premium';

<SearchInput
  onSearch={(value) => console.log(value)}
  debounce={300}
  placeholder="Buscar productos..."
/>
```

#### **PremiumSelect**
Select estilizado.

```jsx
import { PremiumSelect } from '@/components/premium';

<PremiumSelect
  label="Categoría"
  options={[
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' }
  ]}
/>
```

---

### Button Components

#### **PremiumButton**
Botón con múltiples variantes y estados.

```jsx
import { PremiumButton } from '@/components/premium';

<PremiumButton
  variant="primary"
  size="md"
  icon={Save}
  loading={isLoading}
  onClick={handleSave}
>
  Guardar
</PremiumButton>
```

**Variants:**
- `primary`: Azul (CTAs principales)
- `secondary`: Gris (Acciones secundarias)
- `success`: Verde (Acciones positivas)
- `warning`: Amarillo (Precaución)
- `error`: Rojo (Acciones destructivas)
- `ghost`: Transparente
- `outline`: Con borde

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`

#### **IconButton**
Botón solo con icono.

```jsx
import { IconButton } from '@/components/premium';

<IconButton
  icon={Trash2}
  variant="error"
  aria-label="Eliminar"
/>
```

#### **FloatingActionButton**
FAB para acciones principales.

```jsx
import { FloatingActionButton } from '@/components/premium';

<FloatingActionButton
  icon={Plus}
  position="bottom-right"
  onClick={handleAdd}
/>
```

---

### Table Components

#### **PremiumTable**
Tabla avanzada con ordenamiento y estados.

```jsx
import { PremiumTable, TableCell } from '@/components/premium';

const columns = [
  { key: 'id', label: 'ID', render: (val) => <TableCell.ID value={val} /> },
  { key: 'name', label: 'Nombre', render: (val) => <TableCell.Primary value={val} /> },
  { key: 'price', label: 'Precio', render: (val) => <TableCell.Currency value={val} /> },
  { key: 'status', label: 'Estado', render: (val) => <TableCell.Status value={val} variant="success" /> }
];

<PremiumTable
  columns={columns}
  data={data}
  sortable
  stickyHeader
  onRowClick={(row) => console.log(row)}
/>
```

**TableCell Helpers:**
- `TableCell.ID`: ID con color primario
- `TableCell.Status`: Badge de estado
- `TableCell.Currency`: Formato moneda
- `TableCell.Date`: Formato fecha
- `TableCell.Primary`: Texto enfatizado
- `TableCell.Secondary`: Texto secundario

---

### Modal Components

#### **PremiumModal**
Modal con glassmorphism y animaciones.

```jsx
import { PremiumModal } from '@/components/premium';

<PremiumModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título del Modal"
  size="md"
  variant="default"
  footer={<button>Aceptar</button>}
>
  Contenido del modal
</PremiumModal>
```

**Props:**
- `size`: 'sm', 'md', 'lg', 'xl', 'full'
- `variant`: 'default', 'success', 'warning', 'error', 'info'
- `closeOnBackdrop` (boolean): Cerrar al hacer click fuera
- `closeOnEscape` (boolean): Cerrar con tecla ESC

#### **ConfirmModal**
Modal de confirmación pre-configurado.

```jsx
import { ConfirmModal } from '@/components/premium';

<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="¿Eliminar producto?"
  message="Esta acción no se puede deshacer."
  variant="error"
  confirmText="Eliminar"
  cancelText="Cancelar"
/>
```

#### **AlertModal**
Modal de alerta simple.

```jsx
import { AlertModal } from '@/components/premium';

<AlertModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Éxito"
  message="El producto se guardó correctamente."
  variant="success"
/>
```

---

### Statistics Components

#### **StatCard**
Card para mostrar KPIs.

```jsx
import { StatCard } from '@/components/premium';

<StatCard
  label="Ventas del Mes"
  value="$125,430"
  icon={DollarSign}
  trend="up"
  trendValue="+12.5%"
  trendLabel="vs mes anterior"
  color="success"
/>
```

#### **MiniStatCard**
Versión compacta de StatCard.

```jsx
import { MiniStatCard } from '@/components/premium';

<MiniStatCard
  label="Productos"
  value="1,234"
  icon={Package}
  trend="up"
/>
```

#### **StatsGrid**
Grid responsive para estadísticas.

```jsx
import { StatsGrid, StatCard } from '@/components/premium';

<StatsGrid cols={4}>
  <StatCard {...} />
  <StatCard {...} />
  <StatCard {...} />
  <StatCard {...} />
</StatsGrid>
```

#### **ProgressCard**
Card con barra de progreso.

```jsx
import { ProgressCard } from '@/components/premium';

<ProgressCard
  label="Objetivo de Ventas"
  value={75000}
  max={100000}
  color="primary"
  showPercentage
/>
```

#### **ComparisonCard**
Comparación de métricas lado a lado.

```jsx
import { ComparisonCard } from '@/components/premium';

<ComparisonCard
  title="Comparativa Mensual"
  metrics={[
    { label: 'Este Mes', value: '$45,230', subtitle: '+12%' },
    { label: 'Mes Anterior', value: '$40,350', subtitle: '-' }
  ]}
/>
```

---

## 🎨 Estilos CSS Premium

### Glassmorphism

```html
<div class="glass">Contenido con efecto vidrio</div>
<div class="glass-dark">Efecto vidrio oscuro</div>
```

### Sombras Premium

```html
<div class="shadow-premium">Sombra sutil</div>
<div class="shadow-premium-lg">Sombra grande</div>
<div class="shadow-premium-2xl">Sombra extra grande</div>
```

### Gradientes

```html
<div class="gradient-primary">Gradiente primario</div>
<div class="gradient-ocean">Gradiente océano</div>
<div class="gradient-sunset">Gradiente atardecer</div>
```

### Animaciones

```html
<div class="fade-in">Aparece con fade</div>
<div class="slide-up">Desliza hacia arriba</div>
<div class="scale-in">Escala al aparecer</div>
<div class="hover-lift">Levanta al hover</div>
```

### Scrollbar Personalizado

```html
<div class="scrollbar-thin">Scrollbar delgado</div>
<div class="scrollbar-hidden">Sin scrollbar</div>
```

### Badges

```html
<span class="badge-premium badge-primary">Premium</span>
<span class="badge-premium badge-success">Activo</span>
<span class="badge-premium badge-error">Error</span>
```

---

## 🚀 Uso Rápido

### Importación Individual

```jsx
import { PremiumButton, PremiumInput, StatCard } from '@/components/premium';
```

### Importar Estilos

En tu archivo principal (ej: `App.jsx` o `index.jsx`):

```jsx
import '@/styles/premium.css';
```

---

## 📱 Responsive Design

Todos los componentes son responsive por defecto:

- **Mobile**: 1 columna
- **Tablet**: 2 columnas
- **Desktop**: 3-4 columnas
- **Large Desktop**: 4+ columnas

---

## ♿ Accesibilidad

Todos los componentes cumplen con WCAG 2.2 AA:

- ✅ Contraste de color 4.5:1
- ✅ Navegación por teclado
- ✅ Focus indicators visibles
- ✅ ARIA labels apropiados
- ✅ Soporte para lectores de pantalla

---

## 🎯 Mejores Prácticas

1. **Usa variantes semánticas**: `success` para acciones positivas, `error` para destructivas
2. **Proporciona feedback visual**: Loading states, hover effects
3. **Mantén consistencia**: Usa el mismo tamaño de botones en contextos similares
4. **Accesibilidad primero**: Siempre incluye `aria-label` en IconButtons
5. **Performance**: Usa `loading` prop en operaciones asíncronas

---

## 📝 Ejemplos Completos

### Formulario de Producto

```jsx
import { PremiumInput, PremiumSelect, PremiumButton } from '@/components/premium';

function ProductForm() {
  return (
    <form>
      <PremiumInput
        label="Nombre del Producto"
        icon={Package}
        required
      />
      <PremiumInput
        label="Precio"
        type="number"
        icon={DollarSign}
      />
      <PremiumSelect
        label="Categoría"
        options={categories}
      />
      <PremiumButton
        variant="primary"
        icon={Save}
        type="submit"
        fullWidth
      >
        Guardar Producto
      </PremiumButton>
    </form>
  );
}
```

### Dashboard con Estadísticas

```jsx
import { StatsGrid, StatCard, BentoGrid, BentoCard } from '@/components/premium';

function Dashboard() {
  return (
    <>
      <StatsGrid cols={4}>
        <StatCard
          label="Ventas Totales"
          value="$125,430"
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          color="success"
        />
        <StatCard
          label="Pedidos"
          value="1,234"
          icon={ShoppingCart}
          trend="up"
          trendValue="+8.2%"
          color="primary"
        />
        {/* Más stats... */}
      </StatsGrid>
      
      <BentoGrid cols={2}>
        <BentoCard>
          <h3>Gráfico de Ventas</h3>
          {/* Chart component */}
        </BentoCard>
        <BentoCard>
          <h3>Productos Más Vendidos</h3>
          {/* List component */}
        </BentoCard>
      </BentoGrid>
    </>
  );
}
```

---

## 🔧 Personalización

### Colores del Sistema

Los componentes usan variables CSS de Tailwind. Para personalizar:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... más tonos
          600: '#2563eb',
        }
      }
    }
  }
}
```

---

## 📦 Dependencias

- React 18+
- Lucide React (iconos)
- Tailwind CSS 3+
- clsx / tailwind-merge (utilidades)

---

¡Disfruta creando interfaces premium! 🎨✨
