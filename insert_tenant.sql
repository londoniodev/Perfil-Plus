INSERT INTO "Tenant" (id, slug, "dbName", name, status, plan, "ownerEmail", design, features, "createdAt", "updatedAt") 
VALUES (1, 'mauro', 'db_mauromera', 'Mauro Mera', 'ACTIVE', 'PRO', 'admin@mauromera.com', '{"logo": null, "slogan": "Bienvenido", "coverVideo": null}', ARRAY['RESTAURANT','ECOMMERCE','BLOG','LMS'], NOW(), NOW()) 
ON CONFLICT (slug) DO NOTHING;
