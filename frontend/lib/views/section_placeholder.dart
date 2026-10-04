import 'package:flutter/widgets.dart';

/// Identifica la sección mientras se prepara su contenido de producto.
class SectionPlaceholder extends StatelessWidget {
  const SectionPlaceholder({required this.title, super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Semantics(
        header: true,
        child: Text(
          title,
          style: const TextStyle(
            fontFamily: 'Jeko',
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1B1B1B),
          ),
        ),
      ),
    );
  }
}
