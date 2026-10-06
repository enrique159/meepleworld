import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../network/api_exception.dart';

class RefreshTokenStorage {
  RefreshTokenStorage({required String apiUrl})
    : _key = 'meepleworld.refresh.$apiUrl';

  final String _key;
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.unlocked_this_device,
    ),
  );

  Future<String?> read() => _guard(() => _storage.read(key: _key));

  Future<void> write(String token) =>
      _guard(() => _storage.write(key: _key, value: token));

  Future<void> clear() => _guard(() => _storage.delete(key: _key));

  Future<T> _guard<T>(Future<T> Function() operation) async {
    try {
      return await operation();
    } catch (_) {
      throw const ApiException(
        'No se pudo acceder al almacenamiento seguro del dispositivo.',
      );
    }
  }
}
