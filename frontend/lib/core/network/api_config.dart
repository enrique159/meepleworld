import 'package:flutter/foundation.dart';

class ApiConfig {
  ApiConfig.fromEnvironment()
    : baseUri = Uri.parse(
        const String.fromEnvironment(
          'API_BASE_URL',
          defaultValue: 'https://meepleworld-api.enriquemarin.xyz/api/v1',
        ).replaceFirst(RegExp(r'/+$'), ''),
      ) {
    if (!baseUri.hasAuthority ||
        !['http', 'https'].contains(baseUri.scheme) ||
        baseUri.userInfo.isNotEmpty ||
        baseUri.hasQuery ||
        baseUri.hasFragment ||
        (!kDebugMode && baseUri.scheme != 'https')) {
      throw StateError(
        'API_BASE_URL debe ser una URL de API válida; fuera de debug requiere HTTPS.',
      );
    }
  }

  final Uri baseUri;

  Uri endpoint(String path) => Uri.parse('$baseUri/$path');
}
