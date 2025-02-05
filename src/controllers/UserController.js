const User = require("../models/User")
const bcrypt = require('bcrypt');

class UserController {
    async findAll(request, response) {
        const data = await User.findAll({attributes: ['id', 'nome', 'email'], include: {association: 'roles', attributes: ['id', 'description']}})
        const total = await User.count()

        return response.status(200).send({ records: data, total })
    }

    async findById(request, response) {
        const { id } = request.params
        const data = await User.findByPk(id, {select: ['id', 'nome', 'email']})

        if (!data) {
            return response.status(404).send({ message: "Usuário não encontrado" })
        }

        return response.status(200).send(data)
    }

    async createNewUser(request, response) {
        try {
            const { email, nome, password } = request.body
            if (!email || !password) {
                return response.status(400).send({ message: "O email e a senha são obrigatórios" })
            }

            const user = await User.findOne({ where: { email: email } })
            if (user) {
                return response.status(400).send({ message: "Usuário já cadastrado" })
            }

            const senhaEncriptada = await bcrypt.hash(password, 10);

            const data = await User.create({
                email,
                nome,
                password: senhaEncriptada
            })

            return response.status(201).send(data)
        } catch (error) {
            console.log(error.message)
            return response.status(400).send({ message: "O usuário não pôde ser criado!" })
        }
    }

    async updateUser(request, response) {
        try {
            const { id } = request.params
            const { email, nome, password } = request.body

            const user = await User.findByPk(id)
            if (!user) {
                return response.status(404).send({ message: "Usuário não encontrado" })
            }

            const data = await user.update({
                email,
                nome,
                password
            })

            return response.status(200).send(data)
        } catch (error) {
            console.log(error.message)
            return response.status(400).send({ message: "O usuário não pôde ser atualizado!" })
        }
    }

    async deleteUser(request, response) {
        try {
            const { id } = request.params

            const user = await User.findByPk(id)
            if (!user) {
                return response.status(404).send({ message: "Usuário não encontrado" })
            }

            await user.destroy()

            return response.status(204).send()
        } catch (error) {
            console.log(error.message)
            return response.status(400).send({ message: "O usuário não pôde ser deletado!" })
        }
    }
}

module.exports = new UserController()