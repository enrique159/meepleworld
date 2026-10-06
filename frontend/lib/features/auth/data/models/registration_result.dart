class RegistrationResult {
  const RegistrationResult({
    required this.email,
    required this.emailVerified,
    required this.verificationEmailQueued,
  });

  final String email;
  final bool emailVerified;
  final bool verificationEmailQueued;

  String get message => emailVerified
      ? 'Cuenta creada. Ya puedes iniciar sesión.'
      : 'Cuenta creada. Confirma tu correo antes de iniciar sesión.';
}
