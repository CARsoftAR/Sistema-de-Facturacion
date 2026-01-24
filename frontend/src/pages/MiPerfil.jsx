import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Camera, Save, Key, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SuccessModal, ErrorModal } from '../components/common/CustomModals';

const s = {
    container: { padding: '40px', maxWidth: '900px', margin: '0 auto' },
    header: { marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' },
    subtitle: { color: '#64748b', fontSize: '14px' },
    card: { backgroundColor: 'white', border: 'none', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '24px' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '700', color: '#3b82f6', marginBottom: '24px' },
    label: { display: 'block', fontWeight: '600', color: '#334155', marginBottom: '8px', fontSize: '14px' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border 0.2s', fontSize: '14px' },
    avatarContainer: { display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' },
    avatarWrapper: { position: 'relative', width: '100px', height: '100px' },
    avatar: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #e0e7ff', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
    cameraBtn: { position: 'absolute', bottom: '0', right: '0', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
    saveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '14px 28px', borderRadius: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
    fieldGroup: { marginBottom: '24px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    infoBox: { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' },
    infoLabel: { fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    infoValue: { fontSize: '14px', color: '#1e293b', fontWeight: '600' },
    passwordInput: { position: 'relative' },
    eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }
};

const MiPerfil = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Modal States
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'success', // 'success' or 'error'
        title: '',
        message: ''
    });

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        telefono: '',
        imagen_url: ''
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const showModal = (type, title, message) => {
        setModalState({
            isOpen: true,
            type,
            title,
            message
        });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/mi-perfil/info/');
            if (response.data.data) {
                setProfile({
                    first_name: response.data.data.first_name || '',
                    last_name: response.data.data.last_name || '',
                    email: response.data.data.email || '',
                    telefono: response.data.data.telefono || '',
                    imagen_url: response.data.data.imagen_url || ''
                });
            } else if (response.data && !response.data.ok) {
                // Fallback
                setProfile({
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || '',
                    email: response.data.email || '',
                    telefono: response.data.telefono || '',
                    imagen_url: response.data.imagen_url || ''
                });
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            showModal('error', 'Error', 'No se pudo cargar la información del perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const response = await axios.post('/api/mi-perfil/info/', profile);
            if (response.data.ok) {
                showModal('success', 'Guardado', 'Perfil actualizado correctamente');
                if (refreshUser) refreshUser();
            } else {
                showModal('error', 'Error', response.data.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error guardando perfil:', error);
            showModal('error', 'Error', 'Ocurrió un error al guardar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            showModal('error', 'Error', 'Las contraseñas no coinciden');
            return;
        }
        if (passwords.new.length < 6) {
            showModal('error', 'Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setSavingPassword(true);
        try {
            const response = await axios.post('/api/mi-perfil/password/', {
                current_password: passwords.current,
                new_password: passwords.new
            });
            if (response.data.ok) {
                showModal('success', '¡Éxito!', 'Contraseña actualizada correctamente');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                showModal('error', 'Error', response.data.error || 'Error al cambiar contraseña');
            }
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            showModal('error', 'Error', 'Ocurrió un error al cambiar la contraseña');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('imagen', file);

        try {
            const response = await axios.post('/api/mi-perfil/imagen/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.ok) {
                setProfile(prev => ({ ...prev, imagen_url: response.data.imagen_url }));
                showModal('success', '¡Imagen Actualizada!', 'Tu foto de perfil se ha actualizado correctamente');
                if (refreshUser) refreshUser();
            }
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            showModal('error', 'Error', 'No se pudo subir la imagen');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>Mi Perfil</h1>
                <p style={s.subtitle}>Gestiona tu información personal y contraseña</p>
            </header>

            {/* Información del Usuario */}
            <div style={s.card}>
                <div style={s.sectionTitle}>
                    <User size={20} />
                    <span>Información Personal</span>
                </div>

                <div style={s.avatarContainer}>
                    <div style={s.avatarWrapper}>
                        <div style={s.avatar}>
                            {profile.imagen_url ? (
                                <img src={profile.imagen_url} alt="Avatar" style={s.avatarImage} />
                            ) : (
                                <User size={40} color="#3b82f6" />
                            )}
                        </div>
                        <label style={s.cameraBtn}>
                            <Camera size={14} color="white" />
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>
                            {profile.first_name || user?.username || 'Usuario'}
                        </h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                            {user?.rol || 'Usuario del sistema'}
                        </p>
                    </div>
                </div>

                <div style={s.row}>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Nombre</label>
                        <input
                            type="text"
                            style={s.input}
                            value={profile.first_name}
                            onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Apellido</label>
                        <input
                            type="text"
                            style={s.input}
                            value={profile.last_name}
                            onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Tu apellido"
                        />
                    </div>
                </div>

                <div style={s.row}>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Email</label>
                        <input
                            type="email"
                            style={s.input}
                            value={profile.email}
                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Teléfono</label>
                        <input
                            type="text"
                            style={s.input}
                            value={profile.telefono}
                            onChange={(e) => setProfile(prev => ({ ...prev, telefono: e.target.value }))}
                            placeholder="+54 11 1234-5678"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        style={{
                            ...s.saveBtn,
                            opacity: saving ? 0.7 : 1,
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleSaveProfile}
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* Información de Cuenta (Solo lectura) */}
            <div style={s.card}>
                <div style={s.sectionTitle}>
                    <Shield size={20} />
                    <span>Información de Cuenta</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={s.infoBox}>
                        <div style={s.infoLabel}>Usuario</div>
                        <div style={s.infoValue}>{user?.username || '-'}</div>
                    </div>
                    <div style={s.infoBox}>
                        <div style={s.infoLabel}>Rol</div>
                        <div style={s.infoValue}>{user?.rol || '-'}</div>
                    </div>
                    <div style={s.infoBox}>
                        <div style={s.infoLabel}>Estado</div>
                        <div style={{ ...s.infoValue, color: '#16a34a' }}>
                            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Activo
                        </div>
                    </div>
                </div>
            </div>

            {/* Cambiar Contraseña */}
            <div style={s.card}>
                <div style={s.sectionTitle}>
                    <Key size={20} />
                    <span>Cambiar Contraseña</span>
                </div>

                <div style={s.fieldGroup}>
                    <label style={s.label}>Contraseña Actual</label>
                    <div style={s.passwordInput}>
                        <input
                            type={showPasswords.current ? 'text' : 'password'}
                            style={s.input}
                            value={passwords.current}
                            onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                            placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                            style={s.eyeBtn}
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            type="button"
                        >
                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div style={s.row}>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Nueva Contraseña</label>
                        <div style={s.passwordInput}>
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                style={s.input}
                                value={passwords.new}
                                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                style={s.eyeBtn}
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                type="button"
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Confirmar Nueva Contraseña</label>
                        <div style={s.passwordInput}>
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                style={s.input}
                                value={passwords.confirm}
                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                placeholder="Repite la nueva contraseña"
                            />
                            <button
                                style={s.eyeBtn}
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                type="button"
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        style={{
                            ...s.saveBtn,
                            backgroundColor: '#64748b',
                            opacity: savingPassword ? 0.7 : 1,
                            cursor: savingPassword ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleChangePassword}
                        disabled={savingPassword || !passwords.current || !passwords.new}
                    >
                        {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />}
                        {savingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                </div>
            </div>

            {/* Modals */}
            <SuccessModal
                isOpen={modalState.isOpen && modalState.type === 'success'}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
            />
            <ErrorModal
                isOpen={modalState.isOpen && modalState.type === 'error'}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
            />
        </div>
    );
};

export default MiPerfil;
