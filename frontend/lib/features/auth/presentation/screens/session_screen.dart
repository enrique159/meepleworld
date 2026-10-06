import 'package:flutter/material.dart';

import '../view_models/auth_session_view_model.dart';

class SessionScreen extends StatelessWidget {
  const SessionScreen({required this.session, super.key});

  final AuthSessionViewModel session;

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: session,
    builder: (context, _) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (session.busy) ...[
          const Center(child: CircularProgressIndicator()),
          const SizedBox(height: 16),
          const Text('Comprobando sesión…'),
        ] else ...[
          Semantics(
            liveRegion: true,
            child: Text(
              session.errorMessage ?? 'No se pudo comprobar la sesión.',
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: session.initialize,
            child: const Text('Reintentar'),
          ),
          TextButton(
            onPressed: session.signOut,
            child: const Text('Cerrar sesión en este dispositivo'),
          ),
        ],
      ],
    ),
  );
}
