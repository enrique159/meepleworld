import 'auth_user.dart';

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
    required this.user,
  });

  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;
  final AuthUser user;

  bool get needsRefresh =>
      !expiresAt.isAfter(DateTime.now().add(const Duration(seconds: 30)));
}
