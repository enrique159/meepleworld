import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({required this.config, required this.client});

  final ApiConfig config;
  final http.Client client;

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    String? accessToken,
  }) async {
    final request = http.Request('POST', config.endpoint(path))
      ..followRedirects = false
      ..headers['Accept'] = 'application/json';
    if (body != null) {
      request.headers['Content-Type'] = 'application/json';
      request.body = jsonEncode(body);
    }
    if (accessToken != null) {
      request.headers['Authorization'] = 'Bearer $accessToken';
    }

    try {
      final response = await _send(request)
          .timeout(const Duration(seconds: 15));
      final decoded = response.bodyBytes.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(utf8.decode(response.bodyBytes));
      if (decoded is! Map<String, dynamic>) {
        throw const FormatException();
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw ApiException(
          decoded['message'] is String
              ? decoded['message'] as String
              : 'No se pudo completar la solicitud.',
          statusCode: response.statusCode,
          code: decoded['code'] is String ? decoded['code'] as String : null,
        );
      }
      return decoded;
    } on TimeoutException {
      throw const ApiException(
        'La solicitud tardó demasiado. Intenta de nuevo.',
      );
    } on http.ClientException {
      throw const ApiException(
        'No se pudo conectar. Revisa tu conexión e intenta de nuevo.',
      );
    } on FormatException {
      throw const ApiException(
        'El servidor devolvió una respuesta inesperada.',
      );
    }
  }

  Future<http.Response> _send(http.Request request) async =>
      http.Response.fromStream(await client.send(request));

  void close() => client.close();
}
