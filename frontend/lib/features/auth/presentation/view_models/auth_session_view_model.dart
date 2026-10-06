import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:meepleworld/core/network/api_exception.dart';

import '../../data/models/auth_session.dart';
import '../../data/models/auth_user.dart';
import '../../data/repositories/auth_repository.dart';

class AuthSessionViewModel extends ChangeNotifier {
  AuthSessionViewModel(this._repository);

  final AuthRepository _repository;
  AuthSession? _session;
  Timer? _refreshTimer;
  Future<void>? _restoring;
  bool _disposed = false;
  bool initialized = false;
  bool busy = false;
  String? errorMessage;
  String? signedOutMessage;

  bool get isAuthenticated => _session != null;
  AuthUser? get user => _session?.user;

  Future<void> initialize() {
    final pending = _restoring;
    if (pending != null) return pending;
    final operation = _restore();
    _restoring = operation;
    return operation.whenComplete(() => _restoring = null);
  }

  Future<void> _restore() async {
    busy = true;
    errorMessage = null;
    _notify();
    try {
      final session = await _repository.restoreSession();
      if (_disposed) return;
      _setSession(session);
      initialized = true;
    } on ApiException catch (error) {
      if (_disposed) return;
      _setSession(null);
      initialized = false;
      errorMessage = error.message;
    } finally {
      busy = false;
      _notify();
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    busy = true;
    _notify();
    try {
      final session = await _repository.signIn(
        email: email,
        password: password,
      );
      if (_disposed) return;
      signedOutMessage = null;
      _setSession(session);
      initialized = true;
    } finally {
      busy = false;
      _notify();
    }
  }

  Future<void> signOut() async {
    if (busy) return;
    busy = true;
    errorMessage = null;
    _refreshTimer?.cancel();
    _notify();
    try {
      signedOutMessage = await _repository.signOut(_session);
      if (_disposed) return;
      _setSession(null);
      initialized = true;
    } on ApiException catch (error) {
      errorMessage = error.message;
      _setSession(null);
      initialized = false;
    } finally {
      busy = false;
      _notify();
    }
  }

  void onResume() {
    if (!busy && (!initialized || (_session?.needsRefresh ?? false))) {
      unawaited(initialize());
    }
  }

  void _setSession(AuthSession? session) {
    _refreshTimer?.cancel();
    _session = session;
    if (session != null) {
      final untilRefresh =
          session.expiresAt.difference(DateTime.now()) -
          const Duration(seconds: 30);
      _refreshTimer = Timer(
        untilRefresh.isNegative ? Duration.zero : untilRefresh,
        () => unawaited(initialize()),
      );
    }
  }

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    _refreshTimer?.cancel();
    super.dispose();
  }
}
