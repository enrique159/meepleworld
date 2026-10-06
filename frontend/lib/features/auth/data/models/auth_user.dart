class AuthUser {
  const AuthUser({
    required this.id,
    required this.username,
    required this.displayName,
    required this.email,
  });

  final String id;
  final String username;
  final String displayName;
  final String email;
}
