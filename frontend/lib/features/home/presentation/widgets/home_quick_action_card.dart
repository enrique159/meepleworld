import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:hugeicons/hugeicons.dart';

/// Tarjeta visual de Inicio; no presupone rutas ni acciones de producto.
class HomeQuickActionCard extends StatefulWidget {
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
  State<HomeQuickActionCard> createState() => _HomeQuickActionCardState();
}

class _HomeQuickActionCardState extends State<HomeQuickActionCard> {
  bool _isPressed = false;
  Timer? _releaseTimer;

  void _setPressed(bool pressed) {
    _releaseTimer?.cancel();
    if (_isPressed == pressed) return;
    setState(() => _isPressed = pressed);
  }

  void _releaseAfterTap() {
    // Completar el efecto también cuando el toque termina antes del primer frame.
    _releaseTimer = Timer(
      const Duration(milliseconds: 150),
      () => _setPressed(false),
    );
  }

  @override
  void dispose() {
    _releaseTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final image = widget.backgroundImage;
    final disableAnimations = MediaQuery.disableAnimationsOf(context);

    return Semantics(
      button: true,
      enabled: widget.onPressed != null,
      label: widget.label,
      onTap: widget.onPressed,
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTapDown: (_) => _setPressed(true),
        onTapUp: (_) => _releaseAfterTap(),
        onTapCancel: () => _setPressed(false),
        onTap: widget.onPressed,
        child: AnimatedScale(
          scale: _isPressed && !disableAnimations ? 0.95 : 1,
          duration: disableAnimations
              ? Duration.zero
              : const Duration(milliseconds: 150),
          curve: Curves.easeOutCubic,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: ColoredBox(
              color: widget.color,
              child: image == null ? _colorContent() : _imageContent(image),
            ),
          ),
        ),
      ),
    );
  }

  Widget _colorContent() {
    return Padding(
      padding: const EdgeInsets.all(HomeQuickActionCard.contentPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: HomeQuickActionCard.iconBadgeSize,
            height: HomeQuickActionCard.iconBadgeSize,
            decoration: const BoxDecoration(
              color: Color(0x33FFFFFF),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: HugeIcon(icon: widget.icon, size: 24, strokeWidth: 1.7),
            ),
          ),
          const Spacer(),
          const SizedBox(height: HomeQuickActionCard.labelSpacing),
          Padding(
            padding: const EdgeInsets.only(left: 6),
            child: Text(widget.label, style: HomeQuickActionCard.labelStyle),
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
          padding: const EdgeInsets.all(HomeQuickActionCard.contentPadding + 4),
          child: Align(
            alignment: Alignment.bottomLeft,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Text(
                    widget.label.replaceFirst(' ', '\n'),
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
                  icon: widget.icon,
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
