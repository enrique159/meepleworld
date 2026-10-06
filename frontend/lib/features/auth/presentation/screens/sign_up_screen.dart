import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:meepleworld/app/router/app_routes.dart';

import '../view_models/sign_up_view_model.dart';
import '../widgets/auth_validators.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({required this.createViewModel, super.key});

  final SignUpViewModel Function() createViewModel;

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  late final SignUpViewModel _viewModel = widget.createViewModel();

  Future<void> _submit() async {
    if (_viewModel.busy || !_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    final result = await _viewModel.submit(
      displayName: _name.text,
      email: _email.text,
      password: _password.text,
    );
    if (!mounted || result == null) return;
    _password.clear();
    context.go(AppRoutes.signIn, extra: result);
  }

  @override
  void dispose() {
    _viewModel.dispose();
    _name.dispose();
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
              Semantics(
                header: true,
                child: Text(
                  'Crear cuenta',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _name,
                enabled: !_viewModel.busy,
                decoration: const InputDecoration(labelText: 'Nombre'),
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.name],
                validator: AuthValidators.displayName,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _email,
                enabled: !_viewModel.busy,
                decoration: const InputDecoration(
                  labelText: 'Correo electrónico',
                ),
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autocorrect: false,
                autofillHints: const [AutofillHints.email],
                validator: AuthValidators.email,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _password,
                enabled: !_viewModel.busy,
                decoration: const InputDecoration(
                  labelText: 'Contraseña',
                  helperText: 'De 12 a 128 caracteres',
                ),
                obscureText: true,
                autocorrect: false,
                enableSuggestions: false,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.newPassword],
                validator: (value) =>
                    AuthValidators.password(value, registering: true),
                onFieldSubmitted: (_) => _submit(),
              ),
              if (_viewModel.errorMessage case final message?) ...[
                const SizedBox(height: 16),
                Semantics(liveRegion: true, child: Text(message)),
              ],
              const SizedBox(height: 24),
              OutlinedButton(
                onPressed: _viewModel.busy ? null : _submit,
                child: Text(
                  _viewModel.busy ? 'Creando cuenta…' : 'Crear cuenta',
                ),
              ),
              TextButton(
                onPressed: _viewModel.busy
                    ? null
                    : () => context.go(AppRoutes.signIn),
                child: const Text('Ya tengo cuenta. Iniciar sesión'),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
