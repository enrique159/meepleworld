import 'package:meepleworld/core/network/api_client.dart';
import 'package:meepleworld/core/network/api_exception.dart';

import '../models/auth_session.dart';
import '../models/auth_user.dart';
import '../models/registration_result.dart';

class AuthApiService {
  AuthApiService(this._client);

  final ApiClient _client;

  Future<RegistrationResult> signUp({
    required String displayName,
    required String email,
    required String password,
  }) async {
    final json = await _client.post(
      'auth/register',
      body: {
        'displayName': displayName.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );
    return _decode(
      () => RegistrationResult(
        email: json['email'] as String,
        emailVerified: json['emailVerified'] as bool,
        verificationEmailQueued: json['verificationEmailQueued'] as bool,
      ),
    );
  }

  Future<AuthSession> signIn({
    required String email,
    required String password,
  }) async {
    final startedAt = DateTime.now();
    final json = await _client.post(
      'auth/login',
      body: {'email': email.trim().toLowerCase(), 'password': password},
    );
    return _session(json, startedAt);
  }

  Future<AuthSession> refresh(String refreshToken) async {
    final startedAt = DateTime.now();
    final json = await _client.post(
      'auth/refresh',
      body: {'refreshToken': refreshToken},
    );
    return _session(json, startedAt);
  }

  Future<void> signOut(String accessToken) async {
    await _client.post('auth/logout', accessToken: accessToken);
  }

  AuthSession _session(Map<String, dynamic> json, DateTime startedAt) =>
      _decode(() {
        final user = json['user'] as Map<String, dynamic>;
        if (user['emailVerified'] != true) throw const FormatException();
        final expiresIn = json['expiresIn'] as int;
        if (expiresIn <= 0) throw const FormatException();
        return AuthSession(
          accessToken: json['accessToken'] as String,
          refreshToken: json['refreshToken'] as String,
          expiresAt: startedAt.add(Duration(seconds: expiresIn)),
          user: AuthUser(
            id: user['id'] as String,
            username: user['username'] as String,
            displayName: user['displayName'] as String,
            email: user['email'] as String,
          ),
        );
      });

  T _decode<T>(T Function() parse) {
    try {
      return parse();
    } on TypeError {
      throw const ApiException(
        'El servidor devolvió una respuesta inesperada.',
      );
    } on FormatException {
      throw const ApiException(
        'El servidor devolvió una respuesta inesperada.',
      );
    }
  }
}
