import re

with open(r'c:\Sistema de Facturacion\administrar\urls.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace all simple HTML-rendering paths with the TemplateView for react
replacements = [
    (r'path\(\"menu-legacy/\", views\.menu, name=\"menu_legacy\"\)', r'path("menu-legacy/", login_required(TemplateView.as_view(template_name="react_app.html")), name="menu_legacy")'),
    (r'path\(\"menu/\", views\.menu, name=\"menu_legacy_alias\"\)', r'path("menu/", login_required(TemplateView.as_view(template_name="react_app.html")), name="menu_legacy_alias")'),
    (r'path\(\"estado/\", views\.estado_sistema, name=\"estado\"\)', r'path("estado/", login_required(TemplateView.as_view(template_name="react_app.html")), name="estado")'),
    (r'path\(\"contabilidad/\", views\.contabilidad, name=\"contabilidad\"\)', r'path("contabilidad/", login_required(TemplateView.as_view(template_name="react_app.html")), name="contabilidad")'),
    (r'path\(\"reportes/\", views\.reportes, name=\"reportes\"\)', r'path("reportes/", login_required(TemplateView.as_view(template_name="react_app.html")), name="reportes")'),
    (r'path\(\"backups/\", views_backup\.backups, name=\"backups\"\)', r'path("backups/", login_required(TemplateView.as_view(template_name="react_app.html")), name="backups")'),
    (r'path\(\"logs/\", views\.logs, name=\"logs\"\)', r'path("logs/", login_required(TemplateView.as_view(template_name="react_app.html")), name="logs")'),
    (r'path\(\"ayuda/\", views\.ayuda, name=\"ayuda\"\)', r'path("ayuda/", login_required(TemplateView.as_view(template_name="react_app.html")), name="ayuda")'),
    (r'path\(\"comprobantes/nc-nd/\", views_comprobantes\.lista_nc_nd, name=\"lista_nc_nd\"\)', r'path("comprobantes/nc-nd/", login_required(TemplateView.as_view(template_name="react_app.html")), name="lista_nc_nd")'),
    (r'path\(\"comprobantes/remitos/\", views_comprobantes\.lista_remitos, name=\"lista_remitos\"\)', r'path("comprobantes/remitos/", login_required(TemplateView.as_view(template_name="react_app.html")), name="lista_remitos")'),
    (r'path\(\"ctacte/clientes/\", views\.cc_clientes_lista, name=\"cc_clientes_lista\"\)', r'path("ctacte/clientes/", login_required(TemplateView.as_view(template_name="react_app.html")), name="cc_clientes_lista")')
]

for pat, rep in replacements:
    text = re.sub(pat, rep, text)

with open(r'c:\Sistema de Facturacion\administrar\urls.py', 'w', encoding='utf-8') as f:
    f.write(text)

print('Redirections to react_app applied')
