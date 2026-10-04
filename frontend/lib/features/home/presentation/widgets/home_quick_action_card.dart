import 'package:flutter/widgets.dart';
import 'package:hugeicons/hugeicons.dart';

/// Tarjeta visual de Inicio; no presupone rutas ni acciones de producto.
class HomeQuickActionCard extends StatelessWidget {
  const HomeQuickActionCard({
    required this.label,
    required this.icon,
    required this.color,
    this.backgroundImage,
    this.onPressed,
    super.key,
  });

  final String label;
  final List<List<dynamic>> icon;
  final Color color;
  final String? backgroundImage;
  final VoidCallback? onPressed;

  static const contentPadding = 10.0;
  static const iconBadgeSize = 48.0;
  static const labelSpacing = 6.0;
  static const labelStyle = TextStyle(
    fontFamily: 'JekoRegular',
    fontWeight: FontWeight.w600,
    fontSize: 16,
    height: 1.2,
  );

  @override
  Widget build(BuildContext context) {
    final image = backgroundImage;

    return Semantics(
      button: true,
      enabled: onPressed != null,
      label: label,
      onTap: onPressed,
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: onPressed,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: ColoredBox(
            color: color,
            child: image == null ? _colorContent() : _imageContent(image),
          ),
        ),
      ),
    );
  }

  Widget _colorContent() {
    return Padding(
      padding: const EdgeInsets.all(contentPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: iconBadgeSize,
            height: iconBadgeSize,
            decoration: const BoxDecoration(
              color: Color(0x33FFFFFF),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: HugeIcon(icon: icon, size: 24, strokeWidth: 1.7),
            ),
          ),
          const Spacer(),
          const SizedBox(height: labelSpacing),
          Padding(
            padding: const EdgeInsets.only(left: 6),
            child: Text(label, style: labelStyle),
          ),
        ],
      ),
    );
  }

  Widget _imageContent(String image) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset(image, fit: BoxFit.cover, excludeFromSemantics: true),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0x005A326F),
                Color(0x405A326F),
                Color.fromARGB(241, 19, 19, 19),
              ],
              stops: [0, 0.45, 1],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(contentPadding + 4),
          child: Align(
            alignment: Alignment.bottomLeft,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Text(
                    label.replaceFirst(' ', '\n'),
                    style: const TextStyle(
                      fontFamily: 'JekoRegular',
                      fontWeight: FontWeight.w600,
                      fontSize: 22,
                      height: 1,
                      color: Color(0xFFFFFFFF),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                HugeIcon(
                  icon: icon,
                  size: 28,
                  strokeWidth: 2.3,
                  color: const Color(0xFFFFFFFF),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
