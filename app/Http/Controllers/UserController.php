<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UserService;

class UserController extends Controller
{
    protected $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return response()->json($this->service->all());
    }

    public function show($id)
    {
        return response()->json($this->service->find($id));
    }

    public function store(Request $request)
    {
        // A validação fica no controller, para falhar rápido se os dados estiverem errados
        $validatedData = $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'senha' => 'required|string|min:6',
            'data_nascimento' => 'nullable|date',
            // Adicione outras validações conforme necessário
        ]);

        // O controller não sabe COMO o usuário é criado.
        // Ele apenas delega os dados validados para o serviço.
        $user = $this->service->create($validatedData);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'data_nascimento' => 'sometimes|nullable|date',
        ]);

        $user = $this->service->update($id, $validatedData);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $this->service->delete($id);
        return response()->json(['message' => 'User deleted successfully']);
    }
}
