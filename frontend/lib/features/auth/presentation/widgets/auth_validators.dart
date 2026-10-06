abstract final class AuthValidators {
  static String? displayName(String? value) {
    final name = value?.trim() ?? '';
    if (name.isEmpty) return 'Escribe tu nombre.';
    if (name.length > 120) return 'Usa hasta 120 caracteres.';
    return null;
  }

  static String? email(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) return 'Escribe tu correo.';
    if (email.length > 254 ||
        !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      return 'Escribe un correo válido.';
    }
    return null;
  }

  static String? password(String? value, {bool registering = false}) {
    final password = value ?? '';
    if (password.isEmpty) return 'Escribe tu contraseña.';
    if (registering && password.length < 12) {
      return 'Usa al menos 12 caracteres.';
    }
    if (password.length > 128) return 'Usa hasta 128 caracteres.';
    return null;
  }
}
