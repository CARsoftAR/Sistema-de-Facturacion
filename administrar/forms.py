from django import forms
from .models import InvoiceTemplate

class InvoiceTemplateForm(forms.ModelForm):
    class Meta:
        model = InvoiceTemplate
        fields = ['title', 'logo', 'header_html', 'footer_html', 'css', 'active']
        widgets = {
            'header_html': forms.Textarea(attrs={'rows': 5, 'class': 'form-control'}),
            'footer_html': forms.Textarea(attrs={'rows': 5, 'class': 'form-control'}),
            'css': forms.Textarea(attrs={'rows': 10, 'class': 'form-control', 'placeholder': 'CSS personalizado para la factura'}),
        }
