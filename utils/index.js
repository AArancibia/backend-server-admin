export const handleError500list = (err, res, tip) => {
    return res.status(500).json({
        ok: false,
        mensaje: `Error al ${tip} usuarios`,
        errors: err
    });
}

export const handleError500 = (err, res, tip) => {
    return res.status(500).json({
        ok: false,
        mensaje: `Error al ${tip} usuario`,
        errors: err
    });
}

export const handleError400 = (err, res, tip) => {
    return res.status(400).json({
        ok: false,
        mensaje: tip,
        errors: { message: `No existe un usuario con ese id`}
    });
}