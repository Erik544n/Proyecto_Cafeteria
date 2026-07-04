-- Inserts para Pedidos
INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES 
(1, 1, 'ENTREGADO', 85.00, NOW()),
(2, 1, 'ENTREGADO', 120.00, NOW() - interval '1 hour'),
(NULL, 1, 'ENTREGADO', 45.00, NOW() - interval '2 hours'),
(3, 1, 'ENTREGADO', 250.00, NOW() - interval '3 hours'),
(4, 1, 'ENTREGADO', 75.00, NOW() - interval '4 hours'),
(5, 1, 'ENTREGADO', 35.00, NOW() - interval '5 hours'),
(NULL, 1, 'ENTREGADO', 130.00, NOW() - interval '6 hours'),
(6, 1, 'ENTREGADO', 90.00, NOW() - interval '7 hours'),
(7, 1, 'ENTREGADO', 210.00, NOW() - interval '8 hours'),
(NULL, 1, 'ENTREGADO', 55.00, NOW() - interval '9 hours');

-- Ojo: Asumimos que los pedidos anteriores tomaron los IDs del 1 al 10. Si ya había, los IDs podrían ser otros. 
-- Para ser robustos, hacemos inserts individuales con RETURNING o subconsultas.
-- Pero para simplificar en postgres podemos hacer un bloque DO o usar subconsultas.

DO $$
DECLARE
    p_id INT;
BEGIN
    -- Pedido 1
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (1, 1, 'ENTREGADO', 85.00, NOW()) RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 1, 1, 35.00, 35.00), (p_id, 4, 1, 50.00, 50.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'TARJETA', 85.00, 85.00, 85.00, NOW());

    -- Pedido 2
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (2, 1, 'ENTREGADO', 120.00, NOW() - interval '1 hour') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 2, 2, 45.00, 90.00), (p_id, 6, 1, 30.00, 30.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'EFECTIVO', 150.00, 120.00, 120.00, NOW() - interval '1 hour');

    -- Pedido 3
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (NULL, 1, 'ENTREGADO', 45.00, NOW() - interval '2 hours') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 2, 1, 45.00, 45.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'TRANSFERENCIA', 45.00, 45.00, 45.00, NOW() - interval '2 hours');

    -- Pedido 4
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (3, 1, 'ENTREGADO', 250.00, NOW() - interval '3 hours') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 8, 2, 75.00, 150.00), (p_id, 4, 2, 50.00, 100.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'TARJETA', 250.00, 250.00, 250.00, NOW() - interval '3 hours');

    -- Pedido 5
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (4, 1, 'ENTREGADO', 75.00, NOW() - interval '4 hours') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 3, 1, 48.00, 48.00), (p_id, 7, 1, 27.00, 27.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'EFECTIVO', 100.00, 75.00, 75.00, NOW() - interval '4 hours');

    -- Pedido 6
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (5, 1, 'ENTREGADO', 35.00, NOW() - interval '5 hours') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 1, 1, 35.00, 35.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'TARJETA', 35.00, 35.00, 35.00, NOW() - interval '5 hours');

    -- Pedido 7
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (NULL, 1, 'ENTREGADO', 130.00, NOW() - interval '6 hours') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 9, 1, 85.00, 85.00), (p_id, 2, 1, 45.00, 45.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'TRANSFERENCIA', 130.00, 130.00, 130.00, NOW() - interval '6 hours');

    -- Pedido 8
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (6, 1, 'ENTREGADO', 90.00, NOW() - interval '7 hours') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 5, 1, 55.00, 55.00), (p_id, 1, 1, 35.00, 35.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'TARJETA', 90.00, 90.00, 90.00, NOW() - interval '7 hours');

    -- Pedido 9
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (7, 1, 'ENTREGADO', 210.00, NOW() - interval '8 hours') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 8, 2, 75.00, 150.00), (p_id, 10, 1, 40.00, 40.00), (p_id, 1, 1, 20.00, 20.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'EFECTIVO', 250.00, 210.00, 210.00, NOW() - interval '8 hours');

    -- Pedido 10
    INSERT INTO pedidos (mesa_id, usuario_id, estado, total, creado_en) VALUES (NULL, 1, 'ENTREGADO', 55.00, NOW() - interval '9 hours') RETURNING pedido_id INTO p_id;
    INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES (p_id, 5, 1, 55.00, 55.00);
    INSERT INTO ventas (pedido_id, cajero_id, metodo_pago, monto_pagado, subtotal, total, creado_en) VALUES (p_id, 1, 'TARJETA', 55.00, 55.00, 55.00, NOW() - interval '9 hours');
END $$;
