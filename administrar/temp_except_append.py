
    except Exception as e:
        print(f"Error api_notas_credito_listar: {e}")
        return JsonResponse({'error': str(e)}, status=500)
