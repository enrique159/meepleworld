import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:meepleworld/app/router/app_routes.dart';
import 'package:meepleworld/core/ui/widgets/glass_button.dart';
import 'package:meepleworld/core/ui/widgets/glass_text_input.dart';

import '../view_models/sign_in_view_model.dart';
import '../widgets/auth_primary_button.dart';
import '../widgets/auth_validators.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({
    required this.createViewModel,
    this.initialEmail = '',
    this.message,
    super.key,
  });

  final SignInViewModel Function() createViewModel;
  final String initialEmail;
  final String? message;

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _email = TextEditingController(text: widget.initialEmail);
  final _password = TextEditingController();
  late final SignInViewModel _viewModel = widget.createViewModel();
  bool _showPassword = false;

  void _goBack() {
    if (_viewModel.busy) return;
    FocusScope.of(context).unfocus();
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(AppRoutes.authHome);
    }
  }

  Future<void> _submit() async {
    if (_viewModel.busy || !_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    await _viewModel.submit(email: _email.text, password: _password.text);
  }

  @override
  void dispose() {
    _viewModel.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: _viewModel,
    builder: (context, _) => PopScope(
      canPop: !_viewModel.busy,
      child: Form(
        key: _formKey,
        child: AutofillGroup(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: SizedBox.square(
                  dimension: 52,
                  child: GlassButton(
                    semanticLabel: 'Volver',
                    height: 52,
                    padding: EdgeInsets.zero,
                    onPressed: _viewModel.busy ? null : _goBack,
                    child: const HugeIcon(
                      icon: HugeIcons.strokeRoundedArrowLeft01,
                      size: 20,
                      strokeWidth: 1.7,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Semantics(
                header: true,
                child: const Text(
                  'Inicia sesión',
                  style: TextStyle(
                    fontFamily: 'JekoSemiBold',
                    fontSize: 28,
                    height: 1.1,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Ingresa tu correo y contraseña para volver a MeepleWorld',
                style: TextStyle(
                  fontFamily: 'JekoRegular',
                  fontSize: 16,
                  height: 1.2,
                ),
              ),
              if (widget.message case final message?) ...[
                const SizedBox(height: 16),
                Semantics(
                  liveRegion: true,
                  child: Text(
                    message,
                    style: const TextStyle(
                      fontFamily: 'JekoRegular',
                      fontSize: 16,
                      height: 1.2,
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 32),
              const Spacer(),
              GlassTextInput(
                controller: _email,
                placeholder: 'Correo electrónico',
                prependIcon: const HugeIcon(
                  icon: HugeIcons.strokeRoundedMail01,
                  size: 24,
                  strokeWidth: 1.7,
                ),
                enabled: !_viewModel.busy,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autocorrect: false,
                autofillHints: const [AutofillHints.username],
                validator: AuthValidators.email,
              ),
              const SizedBox(height: 20),
              GlassTextInput(
                controller: _password,
                placeholder: 'Contraseña',
                prependIcon: const HugeIcon(
                  icon: HugeIcons.strokeRoundedLockPassword,
                  size: 24,
                  strokeWidth: 1.7,
                ),
                appendIcon: IconButton(
                  tooltip:
                      '${_showPassword ? 'Ocultar' : 'Mostrar'} contraseña',
                  onPressed: _viewModel.busy
                      ? null
                      : () => setState(() => _showPassword = !_showPassword),
                  icon: HugeIcon(
                    icon: _showPassword
                        ? HugeIcons.strokeRoundedView
                        : HugeIcons.strokeRoundedViewOff,
                    size: 24,
                    strokeWidth: 1.7,
                  ),
                ),
                enabled: !_viewModel.busy,
                obscureText: !_showPassword,
                autocorrect: false,
                enableSuggestions: false,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.password],
                validator: (value) => AuthValidators.password(value),
                onSubmitted: (_) => _submit(),
              ),
              if (_viewModel.errorMessage case final message?) ...[
                const SizedBox(height: 16),
                Semantics(
                  liveRegion: true,
                  child: Text(
                    message,
                    style: const TextStyle(fontFamily: 'JekoRegular'),
                  ),
                ),
              ],
              const SizedBox(height: 30),
              AuthPrimaryButton(
                label: _viewModel.busy ? 'Iniciando sesión…' : 'Iniciar sesión',
                onPressed: _viewModel.busy ? null : _submit,
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: _viewModel.busy
                    ? null
                    : () {
                        FocusScope.of(context).unfocus();
                        context.push(AppRoutes.signUp);
                      },
                child: const Text(
                  'Crear cuenta',
                  style: TextStyle(fontFamily: 'JekoRegular', fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
