import 'package:flutter/foundation.dart';
import 'package:meepleworld/core/network/api_exception.dart';

import '../../data/models/registration_result.dart';
import '../../data/repositories/auth_repository.dart';

class SignUpViewModel extends ChangeNotifier {
  SignUpViewModel(this._repository);

  final AuthRepository _repository;
  bool busy = false;
  String? errorMessage;
  bool _disposed = false;

  Future<RegistrationResult?> submit({
    required String displayName,
    required String email,
    required String password,
  }) async {
    if (busy) return null;
    busy = true;
    errorMessage = null;
    notifyListeners();
    try {
      return await _repository.signUp(
        displayName: displayName,
        email: email,
        password: password,
      );
    } on ApiException catch (error) {
      errorMessage = error.message;
      return null;
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
