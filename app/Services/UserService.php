<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class UserService
{
    protected $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    public function all()
    {
        return $this->repository->all();
    }

    public function find($id)
    {
        return $this->repository->find($id);
    }

    public function create(array $data)
    {
        // Se existir a senha em texto plano, gerar o hash aqui
        if (isset($data['senha'])) {
            $data['senha_hash'] = Hash::make($data['senha']);
            unset($data['senha']);
        }

        return $this->repository->create($data);
    }

    public function update($id, array $data)
    {
        // Se o usuário quiser atualizar a senha, também gerar o hash
        if (isset($data['senha'])) {
            $data['senha_hash'] = Hash::make($data['senha']);
            unset($data['senha']);
        }

        return $this->repository->update($id, $data);
    }

    public function delete($id)
    {
        return $this->repository->delete($id);
    }
}
