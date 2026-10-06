import 'package:meepleworld/core/network/api_exception.dart';
import 'package:meepleworld/core/storage/refresh_token_storage.dart';

import '../models/auth_session.dart';
import '../models/registration_result.dart';
import '../services/auth_api_service.dart';
import 'auth_repository.dart';

class RemoteAuthRepository implements AuthRepository {
  RemoteAuthRepository({required this.api, required this.storage});

  final AuthApiService api;
  final RefreshTokenStorage storage;

  @override
  Future<RegistrationResult> signUp({
    required String displayName,
    required String email,
    required String password,
  }) => api.signUp(displayName: displayName, email: email, password: password);

  @override
  Future<AuthSession> signIn({
    required String email,
    required String password,
  }) async => _persist(await api.signIn(email: email, password: password));

  @override
  Future<AuthSession?> restoreSession() async {
    final refreshToken = await storage.read();
    if (refreshToken == null) return null;
    try {
      return await _persist(await api.refresh(refreshToken));
    } on ApiException catch (error) {
      if (!error.endsSession) rethrow;
      await storage.clear();
      return null;
    }
  }

  Future<AuthSession> _persist(AuthSession session) async {
    try {
      await storage.write(session.refreshToken);
      return session;
    } on ApiException {
      // Si no se puede conservar la renovación, no se abre una sesión local.
      try {
        await api.signOut(session.accessToken);
      } on ApiException {
        /* Cierre remoto pendiente si no hay conexión. */
      }
      await storage.clear();
      rethrow;
    }
  }

  @override
  Future<String?> signOut(AuthSession? session) async {
    try {
      var current = session;
      if (current == null || current.needsRefresh) {
        final token = await storage.read();
        if (token != null) current = await api.refresh(token);
      }
      if (current != null) await api.signOut(current.accessToken);
      return null;
    } on ApiException catch (error) {
      return error.endsSession
          ? null
          : 'Sesión cerrada en este dispositivo. No se pudo confirmar el cierre en el servidor.';
    } finally {
      await storage.clear();
    }
  }
}
