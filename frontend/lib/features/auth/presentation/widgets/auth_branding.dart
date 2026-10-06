import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class AuthBranding extends StatelessWidget {
  const AuthBranding({super.key});

  @override
  Widget build(BuildContext context) => Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      SvgPicture.asset(
        'assets/custom/meepleworld_logo.svg',
        width: 96,
        height: 90,
        fit: BoxFit.contain,
        semanticsLabel: 'Logotipo de MeepleWorld',
      ),
      const SizedBox(height: 14),
      Semantics(
        header: true,
        child: const Text(
          'MeepleWorld',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'JekoSemiBold',
            fontSize: 28,
            height: 1.1,
          ),
        ),
      ),
      const SizedBox(height: 6),
      const Text(
        'Encuentra grupos de amigos\ncon quién jugar',
        textAlign: TextAlign.center,
        style: TextStyle(
          color: Colors.white,
          fontFamily: 'JekoRegular',
          fontSize: 16,
          height: 1.25,
        ),
      ),
    ],
  );
}
