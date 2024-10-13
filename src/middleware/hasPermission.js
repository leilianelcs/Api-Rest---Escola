const jwt = require("jsonwebtoken")
const PermissionRole = require("../models/PermissionRole")
const Permission = require("../models/Permission")

function hasPermission(permissions) {
    return async (request, response, next) => {

        // Verificar se o cabeçalho de autorização está presente
        if (!request.headers.authorization) {
            return response.status(401).send({ message: "Token não fornecido" });
        }
        // Verificar se o token está presente        
        const token = request.headers.authorization

        if (!token) {
            return response.status(401).send({ message: "Token não fornecido" });
        }
        // faz a desestruturação do token e verifica se o token é válido
        const decoded = jwt.verify(token, process.env.SECRET_JWT)
        // guarda a lista de roles na payload da request
        request.payload = decoded;

        try { // início bloco try

            // busca todas as permissões com base nas roles do usuário
            const roles = await PermissionRole.findAll({
                where: {
                    // recupera a lista de roles que veio no token
                    roleId: request.payload.roles.map((role) => role.id)
                },
                attributes: ['permissionId'],
                include: [{ model: Permission, as: 'permissions' }]
            })
            
            //  some => Se pelo menos 1 for True, retorna True
            const existPermission = roles.some((role) => {
                // agora com a lista das roles, será validado se no array das permissions
                // recebido como parâmetro, se pelo menos 1 existe
                const hasPermission = role.permissions.some((permissao) => {
                    return permissions.includes(permissao.description)
                })
                return hasPermission
            })

            //  se nenhuma permissão for atendida, será negado o acesso
            if (!existPermission) {
                return response.status(401)
                    .send({ message: "Você não tem autorização para este recurso." })
            }

            //  se não, vai seguir o fluxo (next() - significa que pode seguir)
            next()

            //  validação de erros
        } catch (error) {
            console.log(error)
            return response.status(401).send({
                message: "Autenticação Falhou",
                cause: error.message
            })
        }
    }
}

module.exports = { hasPermission }
