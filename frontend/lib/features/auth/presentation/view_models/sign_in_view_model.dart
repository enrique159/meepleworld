import 'package:flutter/foundation.dart';
import 'package:meepleworld/core/network/api_exception.dart';

import 'auth_session_view_model.dart';

class SignInViewModel extends ChangeNotifier {
  SignInViewModel(this._session);

  final AuthSessionViewModel _session;
  bool busy = false;
  String? errorMessage;
  bool _disposed = false;

  Future<void> submit({required String email, required String password}) async {
    if (busy) return;
    busy = true;
    errorMessage = null;
    notifyListeners();
    try {
      await _session.signIn(email: email, password: password);
    } on ApiException catch (error) {
      errorMessage = error.message;
    } finally {
      busy = false;
      if (!_disposed) notifyListeners();
    }
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
