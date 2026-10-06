import '../models/auth_session.dart';
import '../models/registration_result.dart';

abstract interface class AuthRepository {
  Future<RegistrationResult> signUp({
    required String displayName,
    required String email,
    required String password,
  });
  Future<AuthSession> signIn({required String email, required String password});
  Future<AuthSession?> restoreSession();
  Future<String?> signOut(AuthSession? session);
}
