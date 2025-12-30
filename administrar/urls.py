from django.urls import path
from django.views.generic import TemplateView
# Force reload 2
from . import views
from . import views_backup
from . import views_comprobantes
from django.shortcuts import render
from .views import (
    api_buscar_productos,
    api_producto_info,
    api_productos_eliminar,
    api_productos_verificar_codigo,
)

urlpatterns = [

    # ==========================
    # AUTENTICACIÓN
    # ==========================
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),

    # ==========================
    # MENÚ PRINCIPAL
    # ==========================
    path("", TemplateView.as_view(template_name="react_app.html"), name="menu"),
    path("menu-legacy/", views.menu, name="menu_legacy"),
    path("menu/", views.menu, name="menu_legacy_alias"),

    path("dashboard/", views.dashboard, name="dashboard"),
    path("estado/", views.estado_sistema, name="estado"),
    path("parametros/", views.parametros, name="parametros"),

    # ==========================
    # MÓDULOS COMERCIALES
    # ==========================
    path("ventas/", views.ventas_lista, name="ventas"),
    path("ventas/nuevo/", TemplateView.as_view(template_name="react_app.html"), name="venta_nueva"),
    path("ventas/<int:venta_id>/", views.detalle_venta, name="detalle_venta"),
    path("api/ventas/listar/", views.api_ventas_listar, name="api_ventas_listar"),
    path("api/ventas/guardar/", views.api_venta_guardar, name="api_venta_guardar"),
    path("api/productos/buscar/", views.api_productos_buscar, name="api_productos_buscar"),

    path("compras/", views.compras_lista, name="compras"),
    path("api/compras/listar/", views.api_compras_listar, name="api_compras_listar"),
    path("api/compras/orden/guardar/", views.api_orden_compra_guardar, name="api_orden_compra_guardar"),
    path("api/compras/orden/<int:id>/recibir/", views.api_orden_compra_recibir, name="api_orden_compra_recibir"),
    path("api/compras/orden/<int:id>/cancelar/", views.api_orden_compra_cancelar, name="api_orden_compra_cancelar"),
    path("api/compras/orden/<int:id>/detalle/", views.api_orden_compra_detalle, name="api_orden_compra_detalle"),

    path("clientes/", TemplateView.as_view(template_name="react_app.html"), name="clientes"),
    path("proveedores/", views.proveedores_lista, name="proveedores"),
    path("caja/", views.caja, name="caja"),
    
    # API Caja
    path("api/caja/movimientos/", views.api_caja_movimientos_lista, name="api_caja_movimientos_lista"),
    path("api/caja/movimiento/crear/", views.api_caja_movimiento_crear, name="api_caja_movimiento_crear"),
    path("api/caja/movimiento/<int:id>/", views.api_caja_movimiento_detalle, name="api_caja_movimiento_detalle"),
    path("api/caja/movimiento/<int:id>/editar/", views.api_caja_movimiento_editar, name="api_caja_movimiento_editar"),
    path("api/caja/movimiento/<int:id>/eliminar/", views.api_caja_movimiento_eliminar, name="api_caja_movimiento_eliminar"),
    path("api/caja/saldo/", views.api_caja_saldo_actual, name="api_caja_saldo_actual"),
    path("api/caja/cierre/", views.api_caja_cierre, name="api_caja_cierre"),
    
    # API Plan de Cuentas
    path("api/contabilidad/plan-cuentas/", views.api_plan_cuentas_lista, name="api_plan_cuentas_lista"),
    path("api/contabilidad/plan-cuentas/crear/", views.api_plan_cuentas_crear, name="api_plan_cuentas_crear"),
    path("api/contabilidad/plan-cuentas/<int:id>/editar/", views.api_plan_cuentas_editar, name="api_plan_cuentas_editar"),
    path("api/contabilidad/plan-cuentas/<int:id>/eliminar/", views.api_plan_cuentas_eliminar, name="api_plan_cuentas_eliminar"),
    
    path("contabilidad/", views.contabilidad, name="contabilidad"),
    
    path("reportes/", views.reportes, name="reportes"),

    # API Reportes y Estadísticas
    path("api/estadisticas/ventas/", views.api_estadisticas_ventas, name="api_estadisticas_ventas"),
    path("api/estadisticas/compras/", views.api_estadisticas_compras, name="api_estadisticas_compras"),
    path("api/estadisticas/stock/", views.api_estadisticas_stock, name="api_estadisticas_stock"),
    path("api/estadisticas/caja/", views.api_estadisticas_caja, name="api_estadisticas_caja"),
    path("api/reportes/exportar/", views.api_reportes_exportar, name="api_reportes_exportar"),

    # API Ejercicios Contables
    path("api/contabilidad/ejercicios/", views.api_ejercicios_listar, name="api_ejercicios_listar"),
    path("api/contabilidad/ejercicios/crear/", views.api_ejercicios_crear, name="api_ejercicios_crear"),
    path("api/contabilidad/ejercicios/<int:id>/editar/", views.api_ejercicios_editar, name="api_ejercicios_editar"),
    path("api/contabilidad/ejercicios/<int:id>/eliminar/", views.api_ejercicios_eliminar, name="api_ejercicios_eliminar"),

    # API Asientos Contables
    path("api/contabilidad/asientos/", views.api_asientos_listar, name="api_asientos_listar"),
    path("api/contabilidad/asientos/crear/", views.api_asientos_crear, name="api_asientos_crear"),
    path("api/contabilidad/asientos/<int:id>/", views.api_asientos_detalle, name="api_asientos_detalle"),
    path("api/contabilidad/asientos/<int:id>/eliminar/", views.api_asientos_eliminar, name="api_asientos_eliminar"),

    # API Balance
    path("api/contabilidad/balance/", views.api_balance_generar, name="api_balance_generar"),
    path("api/contabilidad/balance/exportar/", views.api_balance_exportar, name="api_balance_exportar"),

    # API Plan de Cuentas
    path("api/contabilidad/plan-cuentas/", views.api_plan_cuentas_lista, name="api_plan_cuentas_lista"),
    path("api/contabilidad/ejercicios/", views.api_ejercicios_listar, name="api_ejercicios_listar"),

    # API Libro Mayor
    path("api/contabilidad/mayor/", views.api_mayor_consultar, name="api_mayor_consultar"),
    path("api/contabilidad/mayor/exportar/", views.api_mayor_exportar, name="api_mayor_exportar"),

    # API Reportes
    path("api/contabilidad/reportes/libro-diario/", views.api_reporte_libro_diario, name="api_reporte_libro_diario"),
    path("api/contabilidad/reportes/estado-resultados/", views.api_reporte_estado_resultados, name="api_reporte_estado_resultados"),
    path("api/contabilidad/reportes/balance-general/", views.api_reporte_balance_general, name="api_reporte_balance_general"),
    path("api/contabilidad/reportes/resumen-ejercicio/", views.api_reporte_resumen_ejercicio, name="api_reporte_resumen_ejercicio"),

    # Vistas Contabilidad
    path("contabilidad/plan-cuentas/", lambda request: render(request, "administrar/contabilidad/plancuentas.html"), name="plancuentas"),
    path("contabilidad/ejercicios/", lambda request: render(request, "administrar/contabilidad/ejercicios.html"), name="ejercicios"),
    path("contabilidad/asientos/", lambda request: render(request, "administrar/contabilidad/asientos.html"), name="asientos"),
    path("contabilidad/balance/", lambda request: render(request, "administrar/contabilidad/balance.html"), name="balance"),
    path("contabilidad/mayor/", lambda request: render(request, "administrar/contabilidad/mayor.html"), name="mayor"),
    path("contabilidad/reportes/", lambda request: render(request, "administrar/contabilidad/reportes.html"), name="reportes_contables"),
    
    # ==========================
    # BACKUPS
    # ==========================
    path("backups/", views_backup.backups, name="backups"),
    path("api/backups/listar/", views_backup.api_listar_backups, name="api_listar_backups"),
    path("api/backups/crear/", views_backup.api_crear_backup, name="api_crear_backup"),
    path("api/backups/subir/", views_backup.api_subir_backup, name="api_subir_backup"),
    path("api/backups/<int:id>/descargar/", views_backup.api_descargar_backup, name="api_descargar_backup"),
    path("api/backups/<int:id>/restaurar/", views_backup.api_restaurar_backup, name="api_restaurar_backup"),
    path("api/backups/<int:id>/eliminar/", views_backup.api_eliminar_backup, name="api_eliminar_backup"),
    
    path("logs/", views.logs, name="logs"),

    # ==========================
    # USUARIOS Y SEGURIDAD
    # ==========================
    path("usuarios/", views.usuarios, name="usuarios"),
    path("admin_usuarios/", views.admin_usuarios, name="admin_usuarios"),
    path("admin_personalizado/", views.admin_personalizado, name="admin_personalizado"),
    path("seguridad/", views.seguridad, name="seguridad"),
    path("mi-perfil/", views.mi_perfil, name="mi_perfil"),
    path("api/mi-perfil/password/", views.api_mi_perfil_password, name="api_mi_perfil_password"),
    path("api/mi-perfil/imagen/", views.api_mi_perfil_imagen, name="api_mi_perfil_imagen"),

    # ==========================
    # AYUDA Y DOCUMENTACIÓN
    # ==========================
    path("ayuda/", views.ayuda, name="ayuda"),

    # ==========================
    # CRUD PRODUCTOS (REACT)
    # ==========================
    path("productos/", TemplateView.as_view(template_name="react_app.html"), name="productos"),
    path("productos/nuevo/", views.producto_nuevo, name="producto_nuevo"),

    # ==========================
    # CRUD PROVEEDORES (HTML)
    # ==========================
    path("proveedores/nuevo/", views.proveedor_nuevo, name="proveedor_nuevo"),
    path("proveedores/editar/<int:id>/", views.proveedor_editar, name="proveedor_editar"),
    path("proveedores/eliminar/<int:id>/", views.proveedor_eliminar, name="proveedor_eliminar"),

    # ==========================
    # RUBROS (HTML + API)
    # ==========================
    path("rubros/", views.rubros_lista, name="rubros"),
    path("api/rubros/listar/", views.api_rubros_listar, name="api_rubros_listar"),
    path("api/rubros/guardar/", views.api_rubros_guardar, name="api_rubros_guardar"),

    # ==========================
    # GESTIÓN DE CHEQUES
    # ==========================
    path("cheques/", views.cheques_lista, name="cheques"),
    path("api/cheques/listar/", views.api_cheques_listar, name="api_cheques_listar"),
    path("api/cheques/crear/", views.api_cheques_crear, name="api_cheques_crear"),
    path("api/cheques/<int:id>/editar/", views.api_cheques_editar, name="api_cheques_editar"),
    path("api/cheques/<int:id>/eliminar/", views.api_cheques_eliminar, name="api_cheques_eliminar"),
    
    # Helper Clientes
    path("api/clientes/listar-simple/", views.api_clientes_listar_simple, name="api_clientes_listar_simple"),

    path("api/rubros/<int:id>/", views.api_rubros_detalle, name="api_rubros_detalle"),
    path("api/rubros/<int:id>/eliminar/", views.api_rubros_eliminar, name="api_rubros_eliminar"),
    path("api/rubros/verificar/", views.api_rubros_verificar_nombre, name="api_rubros_verificar"),

    # ==========================
    # LOCALIDADES
    # ==========================
    path("localidades/", views.localidades_lista),
    path("api/localidades/listar/", views.api_localidades_listar),
    path("api/localidades/<int:id>/", views.api_localidades_detalle),
    path("api/localidades/guardar/", views.api_localidades_guardar),
    path("api/localidades/<int:id>/eliminar/", views.api_localidades_eliminar),

    # ==========================
    # API CLIENTES
    # ==========================
    path("api/clientes/buscar/", views.api_clientes_buscar, name="api_clientes_buscar"),
    path("api/clientes/<int:id>/", views.api_cliente_detalle, name="api_cliente_detalle"),
    path("api/clientes/nuevo/", views.api_cliente_nuevo, name="api_cliente_nuevo"),
    path("api/clientes/<int:id>/editar/", views.api_cliente_editar, name="api_cliente_editar"),
    path("api/clientes/<int:id>/eliminar/", views.api_cliente_eliminar, name="api_cliente_eliminar"),

    # ==========================
    # API PRODUCTOS – **OFICIAL**
    # ==========================
    path("api/productos/lista/", views.api_productos_lista, name="api_productos_lista"),
    path("api/productos/buscar/", views.api_productos_buscar, name="api_productos_buscar"),
    path("api/productos/<int:id>/", views.api_productos_detalle, name="api_productos_detalle"),
    path("api/productos/nuevo/", views.api_productos_nuevo, name="api_productos_nuevo"),
    path("api/productos/<int:id>/editar/", views.api_productos_editar, name="api_productos_editar"),
    path("api/productos/<int:id>/eliminar/", api_productos_eliminar, name="api_productos_eliminar"),
    path("api/productos/verificar_codigo/", api_productos_verificar_codigo, name="api_productos_verificar_codigo"),

    # Actualización masiva de precios
    path("actualizar-precios/", views.actualizar_precios, name="actualizar_precios"),
    path("api/precios/actualizar-masivo/", views.api_actualizar_precios_masivo, name="api_actualizar_precios_masivo"),

    # ==========================
    # API BUSCAR PRODUCTOS (para pedidos/ventas)
    # ==========================
    path("api/buscar_productos/", api_buscar_productos, name="api_buscar_productos"),
    path("api/producto_info/<int:id>/<str:lista>/", api_producto_info, name="api_producto_info"),

    # ==========================
    # PEDIDOS (ANTIGUO - mantener para compatibilidad)
    # ==========================
    path("pedidos/listado/", views.pedidos_listado, name="pedidos_listado"),
    path("pedidos/nuevo/", views.pedido_nuevo, name="pedido_nuevo"),
    path("api/pedidos/nuevo/", views.api_pedido_nuevo, name="api_pedido_nuevo"),
    path("api/pedidos/<int:pedido_id>/cambiar_estado/", views.api_pedido_cambiar_estado, name="api_pedido_cambiar_estado_old"),
    path("api/pedidos/<int:pedido_id>/facturar/", views.api_pedido_facturar, name="api_pedido_facturar"),

    # ==========================
    # PRESUPUESTOS (COTIZACIONES)
    # ==========================
    path('presupuestos/', views.presupuestos_lista, name='presupuestos'),
    path('presupuesto/nuevo/', views.presupuesto_nuevo, name='presupuesto_nuevo'),
    path('presupuesto/editar/<int:id>/', views.presupuesto_editar, name='presupuesto_editar'),
    path('api/presupuestos/listar/', views.api_presupuestos_listar, name='api_presupuestos_listar'),
    path('api/presupuesto/guardar/', views.api_presupuesto_guardar, name='api_presupuesto_guardar'),
    path('api/presupuesto/cancelar/<int:id>/', views.api_presupuesto_cancelar, name='api_presupuesto_cancelar'),
    path('api/presupuesto/convertir/<int:id>/', views.api_presupuesto_convertir, name='api_presupuesto_convertir'),
    path('presupuesto/pdf/<int:id>/', views.presupuesto_pdf, name='presupuesto_pdf'),

    # ===== MARCAS =====
    path("marcas/", views.marcas_lista, name="marcas_lista"),
    path("api/marcas/listar/", views.api_marcas_listar, name="api_marcas_listar"),
    path("api/marcas/guardar/", views.api_marcas_guardar, name="api_marcas_guardar"),
    path("api/marcas/<int:id>/", views.api_marcas_detalle, name="api_marcas_detalle"),
    path("api/marcas/<int:id>/eliminar/", views.api_marcas_eliminar, name="api_marcas_eliminar"),

    # ==========================
    # API PROVEEDORES
    # ==========================
    path("api/proveedores/lista/", views.api_proveedores_lista, name="api_proveedores_lista"),
    path("api/proveedores/buscar/", views.api_proveedores_buscar, name="api_proveedores_buscar"),
    path("api/proveedores/<int:id>/", views.api_proveedores_detalle, name="api_proveedores_detalle"),
    path("api/proveedores/nuevo/", views.api_proveedores_nuevo, name="api_proveedores_nuevo"),
    path("api/proveedores/<int:id>/editar/", views.api_proveedores_editar, name="api_proveedores_editar"),
    path("api/proveedores/<int:id>/eliminar/", views.api_proveedores_eliminar, name="api_proveedores_eliminar"),

    # ---------------- UNIDADES --------------------
    path("unidades/", views.unidades_lista, name="unidades"),
    path("api/unidades/listar/", views.api_unidades_listar, name="api_unidades_listar"),
    path("api/unidades/guardar/", views.api_unidades_guardar, name="api_unidades_guardar"),
    path("api/unidades/<int:id>/", views.api_unidades_detalle, name="api_unidades_detalle"),
    path("api/unidades/<int:id>/eliminar/", views.api_unidades_eliminar, name="api_unidades_eliminar"),

    # ==========================
    # FACTURACIÓN A4
    # ==========================
    path('plantilla-factura/', views.invoice_templates_gallery, name='invoice_templates_gallery'),
    path('plantilla-factura/editar/', views.invoice_template_edit, name='invoice_template_edit'),
    path('plantilla-factura/editar/<int:template_id>/', views.invoice_template_edit, name='invoice_template_edit_id'),
    path('plantilla-factura/activar/<str:template_name>/', views.invoice_template_activate, name='invoice_template_activate'),
    path('invoice/print/<int:venta_id>/', views.invoice_print, name='invoice_print'),
    path('invoice/preview/', views.invoice_print_preview, name='invoice_print_preview'),

    # ==========================
    # PEDIDOS - MODERNA
    # ==========================
    path('pedidos/', views.pedidos, name='pedidos'),
    path('api/pedidos/lista/', views.api_pedidos_lista, name='api_pedidos_lista'),
    path('api/pedidos/<int:id>/', views.api_pedido_detalle, name='api_pedido_detalle'),
    path('api/pedidos/crear/', views.api_pedido_crear, name='api_pedido_crear'),
    path('api/pedidos/editar/<int:id>/', views.api_pedido_editar, name='api_pedido_editar'),
    path('api/pedidos/eliminar/<int:id>/', views.api_pedido_eliminar, name='api_pedido_eliminar'),
    path('api/pedidos/estado/<int:id>/', views.api_pedido_cambiar_estado, name='api_pedido_cambiar_estado'),
    path('api/pedidos/facturar/<int:id>/', views.api_pedido_facturar, name='api_pedido_facturar'),

    # Usuarios
    path("usuarios/", views.usuarios_lista, name="usuarios_lista"),
    path("api/usuarios/listar/", views.api_usuarios_listar, name="api_usuarios_listar"),
    path("api/usuarios/<int:id>/", views.api_usuario_detalle, name="api_usuario_detalle"),
    path("api/usuarios/crear/", views.api_usuario_crear, name="api_usuario_crear"),
    path("api/usuarios/<int:id>/editar/", views.api_usuario_editar, name="api_usuario_editar"),
    path("api/usuarios/<int:id>/eliminar/", views.api_usuario_eliminar, name="api_usuario_eliminar"),

    # ==========================
    # SEGURIDAD Y ACCESOS
    # ==========================
    path("api/seguridad/cambiar-contrasena/", views.api_cambiar_contrasena, name="api_cambiar_contrasena"),
    path("api/seguridad/historial-login/", views.api_historial_login, name="api_historial_login"),
    path("api/seguridad/sesiones-activas/", views.api_sesiones_activas, name="api_sesiones_activas"),
    path("api/seguridad/cerrar-sesion/<int:session_id>/", views.api_cerrar_sesion_usuario, name="api_cerrar_sesion_usuario"),
    path("api/seguridad/bitacora/", views.api_bitacora_actividades, name="api_bitacora_actividades"),

    # ==========================
    # COMPROBANTES (NC, ND, REMITOS)
    # ==========================
    path("comprobantes/nc-nd/", views_comprobantes.lista_nc_nd, name="lista_nc_nd"),
    path("comprobantes/remitos/", views_comprobantes.lista_remitos, name="lista_remitos"),
    path("comprobantes/nc/crear/<int:venta_id>/", views_comprobantes.crear_nota_credito, name="crear_nota_credito"),
    path("comprobantes/remito/crear/<int:venta_id>/", views_comprobantes.crear_remito, name="crear_remito"),
    path("comprobantes/remito/<int:id>/", views_comprobantes.detalle_remito, name="detalle_remito"),
    path("comprobantes/remito/<int:id>/imprimir/", views_comprobantes.imprimir_remito, name="imprimir_remito"),

    # ==========================
    # CTA. CTE. (CLIENTES Y PROVEEDORES)
    # ==========================
    # HTML Views
    path("ctacte/clientes/", views.cc_clientes_lista, name="cc_clientes_lista"),
    path("ctacte/clientes/<int:id>/", views.cc_cliente_detalle, name="cc_cliente_detalle"),
    path("ctacte/proveedores/", views.cc_proveedores_lista, name="cc_proveedores_lista"),
    path("ctacte/proveedores/<int:id>/", views.cc_proveedor_detalle, name="cc_proveedor_detalle"),
    
    # API Clientes
    path("api/ctacte/clientes/listar/", views.api_cc_clientes_listar, name="api_cc_clientes_listar"),
    path("api/ctacte/clientes/<int:id>/movimientos/", views.api_cc_cliente_movimientos, name="api_cc_cliente_movimientos"),
    path("api/ctacte/clientes/nuevo/", views.api_cc_cliente_nuevo_movimiento, name="api_cc_cliente_nuevo_movimiento"),
    
    # API Proveedores
    path("api/ctacte/proveedores/listar/", views.api_cc_proveedores_listar, name="api_cc_proveedores_listar"),
    path("api/ctacte/proveedores/<int:id>/movimientos/", views.api_cc_proveedor_movimientos, name="api_cc_proveedor_movimientos"),
    path("api/ctacte/proveedores/nuevo/", views.api_cc_proveedor_nuevo_movimiento, name="api_cc_proveedor_nuevo_movimiento"),
    
    # API Recibos
    path("api/recibos/crear/", views.api_recibo_crear, name="api_recibo_crear"),
    path("api/recibos/listar/", views.api_recibos_listar, name="api_recibos_listar"),
    path("api/recibos/<int:id>/", views.api_recibo_detalle, name="api_recibo_detalle"),
    path("api/recibos/<int:id>/imprimir/", views.api_recibo_imprimir, name="api_recibo_imprimir"),
    path("api/recibos/<int:id>/anular/", views.api_recibo_anular, name="api_recibo_anular"),

    # ==========================
    # BANCOS
    # ==========================
    path("bancos/", views.bancos, name="bancos"),
    path("api/bancos/listar/", views.api_bancos_listar, name="api_bancos_listar"),
    path("api/bancos/crear/", views.api_bancos_crear, name="api_bancos_crear"),
    path("api/bancos/movimientos/", views.api_bancos_movimientos, name="api_bancos_movimientos"),
    path("api/bancos/movimiento/crear/", views.api_bancos_movimiento_crear, name="api_bancos_movimiento_crear"),
    path("api/bancos/conciliar/", views.api_bancos_conciliar, name="api_bancos_conciliar"),

]