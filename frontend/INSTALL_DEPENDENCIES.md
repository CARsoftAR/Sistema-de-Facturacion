# Instrucciones de Instalación - Sistema Premium 2025

## ⚠️ Acción Requerida

Para completar la implementación del sistema de diseño premium, necesitas instalar las siguientes dependencias:

### Opción 1: CMD (Recomendado)
Abre el símbolo del sistema (CMD) y ejecuta:

```cmd
cd "c:\Sistema de Facturacion\frontend"
npm install clsx tailwind-merge
```

### Opción 2: PowerShell con permisos
Si prefieres usar PowerShell, primero habilita la ejecución de scripts:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd "c:\Sistema de Facturacion\frontend"
npm install clsx tailwind-merge
```

## 📦 Dependencias Instaladas

Una vez completada la instalación, tendrás:

- **clsx**: Utilidad para combinar clases CSS condicionalmente
- **tailwind-merge**: Fusiona clases de Tailwind evitando conflictos

## ✅ Verificación

Para verificar que las dependencias se instalaron correctamente:

```bash
npm list clsx tailwind-merge
```

Deberías ver algo como:
```
├── clsx@2.x.x
└── tailwind-merge@2.x.x
```

## 🚀 Próximos Pasos

Una vez instaladas las dependencias:

1. **Reinicia el servidor de desarrollo** (si está corriendo):
   ```bash
   npm run dev
   ```

2. **Prueba los componentes premium**:
   - Navega a `/ventas-premium` para ver el ejemplo completo
   - Navega a `/dashboard-inteligente` para ver la capa predictiva

3. **Lee la documentación**:
   - `DESIGN_SYSTEM.md`: Guía completa del sistema de diseño
   - `MIGRATION_PLAN.md`: Plan de migración gradual

## 🐛 Solución de Problemas

### Error: "Cannot find module 'clsx'"
**Solución**: Las dependencias no se instalaron. Ejecuta los comandos de instalación arriba.

### Error: "tailwind-merge is not defined"
**Solución**: Verifica que `tailwind.config.js` esté actualizado con la nueva configuración.

### Error de compilación de Tailwind
**Solución**: Reinicia el servidor de desarrollo después de actualizar la configuración.

## 📞 Soporte

Si encuentras problemas durante la instalación, verifica:
- Versión de Node.js: `node --version` (recomendado: v18+)
- Versión de npm: `npm --version` (recomendado: v9+)
- Permisos de escritura en la carpeta del proyecto

---

**Nota**: Estas dependencias son esenciales para el funcionamiento del sistema de diseño premium. Sin ellas, los componentes no se renderizarán correctamente.
