abstract final class AuthValidators {
  static const displayNameRequired = 'Escribe tu nombre.';
  static const displayNameTooLong = 'Usa hasta 120 caracteres.';
  static const emailRequired = 'Escribe tu correo.';
  static const emailInvalid = 'Escribe un correo válido.';
  static const passwordRequired = 'Escribe tu contraseña.';
  static const passwordTooShort = 'Usa al menos 12 caracteres.';
  static const passwordTooLong = 'Usa hasta 128 caracteres.';
  static const confirmationRequired = 'Repite tu contraseña.';
  static const confirmationMismatch = 'Las contraseñas no coinciden.';

  static const displayNameMessages = [displayNameRequired, displayNameTooLong];
  static const emailMessages = [emailRequired, emailInvalid];
  static const passwordMessages = [
    passwordRequired,
    passwordTooShort,
    passwordTooLong,
  ];
  static const confirmationMessages = [
    confirmationRequired,
    confirmationMismatch,
  ];

  static String? displayName(String? value) {
    final name = value?.trim() ?? '';
    if (name.isEmpty) return displayNameRequired;
    if (name.length > 120) return displayNameTooLong;
    return null;
  }

  static String? email(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) return emailRequired;
    if (email.length > 254 ||
        !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      return emailInvalid;
    }
    return null;
  }

  static String? password(String? value, {bool registering = false}) {
    final password = value ?? '';
    if (password.isEmpty) return passwordRequired;
    if (registering && password.length < 12) {
      return passwordTooShort;
    }
    if (password.length > 128) return passwordTooLong;
    return null;
  }
}
