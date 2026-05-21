--
-- PostgreSQL database dump
--

\restrict pdgfGwAfEdLJ4eusSX39x5YYSKPMLH0qn7IEkY1quGWezNHuznph5eLbM7N8TvS

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg12+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg12+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: tmdt_user
--

CREATE TYPE public."ActivityType" AS ENUM (
    'LOGIN',
    'LOGOUT',
    'REGISTER',
    'UPDATE_PROFILE',
    'CREATE_ORDER',
    'CANCEL_ORDER',
    'ADMIN_ACTION',
    'SYSTEM'
);


ALTER TYPE public."ActivityType" OWNER TO tmdt_user;

--
-- Name: BehaviorType; Type: TYPE; Schema: public; Owner: tmdt_user
--

CREATE TYPE public."BehaviorType" AS ENUM (
    'VIEW',
    'CART',
    'SEARCH',
    'PURCHASE'
);


ALTER TYPE public."BehaviorType" OWNER TO tmdt_user;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: tmdt_user
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO tmdt_user;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: tmdt_user
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO tmdt_user;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: tmdt_user
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO tmdt_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ActivityLog; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."ActivityLog" (
    id text NOT NULL,
    "userId" text,
    action public."ActivityType" NOT NULL,
    details text,
    ip text,
    "userAgent" text,
    path text,
    method text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ActivityLog" OWNER TO tmdt_user;

--
-- Name: Banner; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Banner" (
    id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    "imageUrl" text NOT NULL,
    link text,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Banner" OWNER TO tmdt_user;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "productVariantId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Cart" OWNER TO tmdt_user;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "parentId" text,
    "isDeleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Category" OWNER TO tmdt_user;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "userId" text,
    role text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "suggestedProducts" jsonb
);


ALTER TABLE public."ChatMessage" OWNER TO tmdt_user;

--
-- Name: GlobalNotification; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."GlobalNotification" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type text DEFAULT 'SYSTEM'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GlobalNotification" OWNER TO tmdt_user;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO tmdt_user;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    address text,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "voucherId" text,
    "cancelReason" text
);


ALTER TABLE public."Order" OWNER TO tmdt_user;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "productVariantId" text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO tmdt_user;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    method text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "transactionId" text,
    amount numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Payment" OWNER TO tmdt_user;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "categoryId" text NOT NULL,
    embedding public.vector(768),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "imageEmbedding" public.vector(512),
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Product" OWNER TO tmdt_user;

--
-- Name: ProductAttribute; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."ProductAttribute" (
    id text NOT NULL,
    "productId" text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    unit text
);


ALTER TABLE public."ProductAttribute" OWNER TO tmdt_user;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "imageEmbedding" public.vector(512)
);


ALTER TABLE public."ProductImage" OWNER TO tmdt_user;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    price numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    attributes jsonb
);


ALTER TABLE public."ProductVariant" OWNER TO tmdt_user;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO tmdt_user;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Review" OWNER TO tmdt_user;

--
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."SupportTicket" (
    id text NOT NULL,
    "userId" text NOT NULL,
    subject text NOT NULL,
    status text DEFAULT 'OPEN'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SupportTicket" OWNER TO tmdt_user;

--
-- Name: TicketMessage; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."TicketMessage" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "senderId" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TicketMessage" OWNER TO tmdt_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    avatar text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO tmdt_user;

--
-- Name: UserBehavior; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."UserBehavior" (
    id text NOT NULL,
    "userId" text,
    "productId" text NOT NULL,
    type public."BehaviorType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserBehavior" OWNER TO tmdt_user;

--
-- Name: Voucher; Type: TABLE; Schema: public; Owner: tmdt_user
--

CREATE TABLE public."Voucher" (
    id text NOT NULL,
    code text NOT NULL,
    "discountType" text NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "minOrderValue" numeric(10,2),
    "maxDiscount" numeric(10,2),
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "usageLimit" integer DEFAULT 1 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "categoryId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "productId" text
);


ALTER TABLE public."Voucher" OWNER TO tmdt_user;

--
-- Data for Name: ActivityLog; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."ActivityLog" (id, "userId", action, details, ip, "userAgent", path, method, "createdAt") FROM stdin;
ac9695ca-cb86-44f9-9256-42e2d0dc408d	\N	LOGIN	Response Status: 401	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/login	POST	2026-05-20 07:40:08.022
a696a53c-03ae-4d96-bf42-b79e49e6ae11	\N	LOGIN	Response Status: 401	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/login	POST	2026-05-20 07:40:13.638
3b73915b-2688-4b5e-a399-eadeda1b043a	\N	LOGIN	Response Status: 401	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/login	POST	2026-05-20 07:40:36.139
9e424ba9-bafc-4c0c-abe8-10ff69cba562	\N	LOGIN	Response Status: 401	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/login	POST	2026-05-20 07:40:44.677
c364854b-a6dd-473a-8837-be79e1526451	\N	REGISTER	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/register	POST	2026-05-20 07:41:16.946
c9a44364-29cd-46c6-b14b-fcb61fc0ad88	\N	LOGIN	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/login	POST	2026-05-20 07:42:52.793
178e2fad-94e5-4d6c-aba0-59843624837a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-20 07:42:52.853
e1fe70ee-f7f8-4a16-a6fb-abe8ccbefca5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications?limit=10	GET	2026-05-20 07:42:52.864
d7cb55be-fd2c-4ef3-a8b2-f37501fecb14	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-20 07:42:52.907
e30f744a-faef-4fa3-8a8f-ff844522eed1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/revenue-trend?type=day	GET	2026-05-20 07:42:53.467
8a424a15-99e8-4101-84a5-2b4064f452db	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/top-products?limit=5	GET	2026-05-20 07:42:53.47
5e13d7b4-9b35-431b-8ddb-3af00dbe96b1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:42:53.475
31704e75-67c3-4c70-8be1-2eda736bb984	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/revenue-trend?type=day	GET	2026-05-20 07:42:53.485
f5a53d31-f671-40c0-a5b7-947b1375fb90	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/top-products?limit=5	GET	2026-05-20 07:42:53.497
ad6bd103-e266-4a28-aa7e-b5cfd302e4db	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/overview	GET	2026-05-20 07:42:53.508
9f5c0988-036d-45a3-a539-cc3f35cf761a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/orders?limit=5	GET	2026-05-20 07:42:53.526
88a1531b-7fd4-472b-86af-c9023d84000a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/overview	GET	2026-05-20 07:42:53.531
0290c339-c9af-4cd9-9746-5a6acf2f6300	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/category	GET	2026-05-20 07:42:53.534
f5e4243f-d779-4051-b5dd-520ce7520710	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/orders?limit=5	GET	2026-05-20 07:42:53.555
470a56b3-6b28-477f-8c50-8668e36cbb9e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/category	GET	2026-05-20 07:42:53.571
7fa0cc91-6323-4301-b74c-be58bd7d2cbc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:43:23.423
e25c9d3c-6566-4637-bd8d-fa8b383b845e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:43:53.426
096958f5-918a-48ba-9e26-c5b6fe43e2f1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:44:23.418
69d2cfad-1bdf-4e88-a252-dde636079cdb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:44:53.417
52e46a2b-5695-42e8-9064-af21efdb9543	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:45:23.423
9e3fe59a-0269-40d5-b6f8-7683938d7a54	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:45:53.429
075ed6b2-2631-44e8-98a7-651869dbea65	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:46:23.43
9ae1835e-ffbb-4f38-be9c-7f3189063a75	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:46:53.422
7381e8f2-45a6-4ab8-b23d-c4330d9f19ca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:47:23.427
2724e214-1a6d-46b0-931b-6fbd4793c929	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:47:53.42
a7f0cb24-b03d-4e50-b4c6-a647f222db13	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:48:23.473
816688dc-493d-4ef5-8acb-7a752450e9d9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:48:53.43
759495e0-4d77-4905-ad44-c54fbebe9cf4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:49:23.417
382cfb7d-4a7a-438c-bd77-394dacb1c876	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:49:53.423
0c5a8b79-5268-4287-b2d5-f9c9908d5262	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:50:23.428
9195a04a-15d1-4bcd-8fd4-8920b8a0b3ab	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:50:53.43
c663000c-6221-41a3-b07d-afd35bc878ac	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-20 07:51:08.467
a6f5dae4-bca4-42af-b510-fae2d0606a83	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-20 07:51:08.538
06a497bb-1065-47fe-af97-8578440037ba	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/users	GET	2026-05-20 07:51:11.83
c17eccfd-8527-47c9-8426-8535d39b5e05	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/users	GET	2026-05-20 07:51:11.842
77649c7b-d92c-4d1a-9cdc-4dff79783ca9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/vouchers	GET	2026-05-20 07:51:18.052
6f367363-a00f-4417-aef1-988740f35d44	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/vouchers	GET	2026-05-20 07:51:18.066
e228545b-62d1-4b2a-b40d-1cd9bbb093f6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support	GET	2026-05-20 07:51:20.05
65d13097-e45c-4968-950a-68682dc0ae71	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support	GET	2026-05-20 07:51:20.065
75c11166-0832-4ab0-b4db-0648fad3f8cc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/ai/admin/chatbot/history	GET	2026-05-20 07:51:21.124
b0503256-e321-4f1a-95f3-3ad71e06da4d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/ai/admin/chatbot/history	GET	2026-05-20 07:51:21.155
6dc75d91-a840-43a9-96ba-54e4e2d69ab1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support	GET	2026-05-20 07:51:22.817
f210a100-0c5a-4a4d-992b-e50b2c9d629b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support	GET	2026-05-20 07:51:22.829
67b61116-3af2-4e12-a905-674dbe1469c0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:51:23.424
1b14f0af-8f79-49c5-a9eb-2bec83631798	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:51:54.031
948170ef-2a7d-45d5-945e-ca2ac3e1f05f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:52:55.029
887dbf0b-4a97-443e-88c0-49fd194c604b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:53:55.037
4c983501-87e4-422b-9706-3674aecce162	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:54:55.043
30cf3cd4-c4d3-4491-9c1a-65a5ac28b0ca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:55:55.03
2413c612-831a-4b65-abb5-86af53a5dd4b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:56:55.072
aaa3f55d-5245-475d-b25b-5e850c219e4a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:57:55.089
f5181a6f-675e-49ae-8a61-42a3c3726479	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:58:55.02
6b8c874c-ba0d-43a1-8dd3-ffcbb7a9352a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 07:59:55.03
1d12802c-f93d-4786-92aa-96b8ce0f1a30	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:00:55.038
108529b4-1cd8-450a-a253-212535e87d78	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:01:55.044
d90fb25c-615e-4228-9018-77df8b51c55e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:02:55.085
a0cf68dd-b916-4791-bf40-a2bdb03b8a6f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:03:55.027
9de1fd6a-00ad-4343-aa18-44df92cd63f4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:04:55.035
c3a8e275-23f6-4502-b92a-2232504a4243	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:05:55.051
201b9685-3423-4be2-904d-969ad65992b4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:06:23.42
cb56efdd-bc11-453f-a8bd-f2e608e8094c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:06:54.047
43a72ccb-5014-4ddb-a176-b7cdf46bb0af	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:07:24.024
d78e17fa-c7a1-4d75-bdfb-3307109f50de	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:07:55.035
e657adda-bd3d-4ebe-8594-5fae0af42c88	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/categories/b82d5ea1-db3a-4630-9803-45dfbfa82ce0	DELETE	2026-05-20 08:08:22.971
27a50971-5736-410e-aec6-eaaca3af6f3a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:08:23.459
378e2e3b-bb99-48a8-8c74-463bf9a89476	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/categories/2031fd2d-8222-4b06-bb5c-c0b64792be13	DELETE	2026-05-20 08:08:26.27
5664a13e-6262-4b90-8bc7-5c572cec95fe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/categories/d237c001-028f-4e01-977a-0621ef68678e	DELETE	2026-05-20 08:08:30.81
0a5d1436-dc3f-4dc6-a6a7-e86fbc41c818	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:08:54.049
7e47d2c4-f18e-4d49-a8ff-c3af9cda6795	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:09:24.045
f645cd7c-74cf-47af-bc5f-6117079e51ff	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:09:55.031
55f8b041-9169-445e-a7c7-61603ac5b524	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:10:55.049
03baf9c0-d3ab-4514-b653-a689340ef5d3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:11:55.044
8447e0e5-e4b1-4bf1-a2a5-f3ee9bae06cb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:12:55.066
9c407e71-9561-4e89-9d55-bdda6d5b0d38	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:13:55.141
ac1cef7a-346f-4db7-abf4-313a48e3fde8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:14:55.029
bb631920-b98d-4fb0-b86d-1d3d3d7068fd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:15:55.025
84722de2-cee7-4ff1-baa9-873d51d6d771	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:16:55.03
41fdb30b-091d-4f59-a363-2622322c60e5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:17:55.035
0110aaf8-6583-4731-a87b-07ebacd6fb08	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:18:55.025
7a2ddbf0-7080-4136-b9cc-a95eefa0afb5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:19:55.097
e6b8eba2-4e22-48d4-99ea-607d32d884e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:20:55.024
392c5a0c-c0e1-4779-8940-4cc1433564b0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:21:55.038
c9192a7e-e604-48f8-ad01-e2122c8c3bf6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:22:55.036
96399601-bc17-463e-947a-0ebac0b805e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:23:55.028
0cbc9534-01df-492e-843e-c631c83c4323	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:24:55.023
4b197e0f-9899-4a46-aa66-8fece576d130	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:25:55.104
0b667c15-69cf-4bd4-9a61-19d56db177a1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:26:55.024
50a51a76-44dc-4f40-b4a5-673bc2862705	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:27:55.053
3ab88b72-d65e-45a3-83f7-a40c45d46eab	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:28:55.024
689ddaf3-fc9d-47cb-b67d-d30cf9166d38	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:29:55.023
7a1815a9-cd56-4446-b604-674ab4a47e4c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:30:55.027
16fcfe49-a847-4fc7-b550-168ca50029e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:31:55.113
05d52c06-2d02-432c-a6ee-285eabf0ae9b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:32:55.027
a2ee56f0-f995-4f5d-903a-2854f632a10f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:33:55.02
ae240421-45c3-4925-ae3a-5ca9b43ea677	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:34:55.035
86bc06bf-f23c-463b-be9b-56dea37af2bb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:35:55.027
17a304d9-d773-4dba-99dc-669ec013e4e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:36:55.034
a76cc2d5-0c51-4b41-acff-c8f56f58aaa3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:37:55.106
6ee8724c-d475-41d7-b997-cf84c18c59e5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:38:55.024
a1e31408-17e3-4068-8ddd-0cb2dc2ec138	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:39:55.027
b0d8d32a-1778-43bc-8b87-2fd093f446a9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:40:55.027
243204c3-4c34-45e4-b15c-61ab4b0240f4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:41:55.026
287da799-d3d4-468d-bbfc-4d123f1ea002	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:42:55.055
4e781806-c9af-4d41-adba-44a5c37c5fc5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:43:55.094
65177173-afda-418a-9e6e-9a211ac5e5d1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:44:55.052
c7ce73af-1e53-46fc-8cf9-be1ec0063193	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:45:55.035
0b639472-e4e4-4509-abb1-c924aa5685bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:46:55.041
b5634478-da43-460c-9aa4-869138d32da5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:47:55.03
e9157129-ab19-4e20-8d9a-469ecbbaf64c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:48:55.026
8f39291d-ff50-40f6-b776-d683e7826938	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:49:55.116
437d238a-e3fa-4565-8fa1-e68334b17d26	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:50:55.033
a2259371-bb2c-4520-9717-bed09a8bb068	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:51:55.044
d6f9d6d5-b512-4ff9-9487-f0139d89ec96	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:52:55.032
8427c556-d478-4a7c-8337-bc2b9f9d09dc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:53:55.031
185b55a8-c06f-4ae0-9398-8875c9c75d30	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:54:55.022
e54b5f71-5654-40ef-825f-eca0117baef4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:55:55.124
05cf4a2d-ead0-41ee-9525-19bf98945d79	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:56:55.045
ca0fe693-d738-431b-aeca-f72022e1c65c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:57:55.065
4a32adc0-f8f1-43ce-8a27-a2657a6ff60f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:58:55.027
cbb5e063-c021-4736-a978-ba9d2daccdad	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 08:59:55.02
274701e2-0076-44c8-9410-834f8be38f8f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:00:55.021
ced12b4f-9076-49e3-b091-7d1ba806e579	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:01:55.097
8b38969f-c107-4d5d-a53a-8cf4499f19b8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:02:55.031
3a28f4cd-8ab3-44b0-b41b-891760c42ccc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:03:55.038
38b22146-67e4-45b0-96a1-716f3266fb4e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:04:55.028
072d93c8-1665-4880-8887-fa4e627dc949	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:05:55.027
5a78f2ae-12e7-4119-ac0d-2c08cbc92f02	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:06:55.026
ab0e488e-77de-4bd6-ab0d-ec9c28c778c3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:07:55.094
607c1e48-3534-4a37-902b-466ef4d9e6d3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:08:55.022
e97c5ab8-b2ff-4291-ace5-74966be72df6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:09:55.02
222c2ddf-3ddc-44b2-9b5e-8bb2acafa4b5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:10:55.027
f685b3ff-9051-47cc-ae88-22c985da11f2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:11:55.02
5ab5adc8-e865-452e-8c2d-772b9dd78f70	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:12:55.053
9c88c794-060d-4b25-8b58-ab4459cc6d7a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:13:55.112
fa9e1fbb-6568-4e51-91a2-a2891b26bdd4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:14:55.049
4b7b7027-e06a-48f8-a414-2ee9698119f3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:15:55.021
8f098d8e-8e46-4ad8-9413-67f5d3676411	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:16:55.017
035ec7a8-33a5-4134-856c-499aa54a7e90	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:17:55.029
d3549f6e-fff7-41c7-8a0c-b8aecc0072e3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:18:55.031
fdd0c148-8680-41f3-9910-617dc8622b5a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:19:55.103
bf5d160f-addd-40ab-b093-5fc0a2d9e91d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:20:55.023
8e792888-1e2d-40d5-9674-7cc2f0fea43c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:21:55.024
da33fbd8-9849-4a4e-9a15-34347800183e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:22:55.025
f3e06d91-c7d8-41f2-87d4-a74612a5f17e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:23:55.022
dc0d7239-16ab-41ef-8cf0-4db8a15b29f1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:24:55.037
d64ad272-3d2d-42a2-92f4-8a1e6ef61aa4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:25:55.104
74194b58-9cc9-48ae-b753-6d828d2c0d48	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:26:55.021
38796abd-a6b8-41e7-8c70-0aa1ac63671b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:27:55.04
67cd908e-a9c8-4929-93db-f19501c67169	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:28:55.02
012e51f3-3763-431d-b488-a66827364216	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:29:55.028
f9ddd189-2fdd-42a8-9c74-f0de526cc335	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:30:55.03
33d2761e-1882-4214-b29b-132e3c664389	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:31:55.104
5edbdf16-dc17-4d0c-8611-b7dd4e3f7022	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:32:55.032
761a6be5-8c6f-4f6a-95a6-e60d79ad435c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:33:55.04
58bd0e8f-e6d3-4a55-90cf-10dbda9caa12	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:34:55.031
7ea84eeb-0c91-4911-beb3-42b4fe28d47a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:35:55.027
9539b30f-82e3-4b1e-aa54-961c676f3ac6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:36:55.04
9a45804e-b024-4591-9acd-412affc203d2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:37:55.116
fde3c2a4-0162-4b7e-ba36-7987cfcdccc7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:38:55.028
63442398-4570-4839-a27d-397477e907a3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:39:55.028
11f9816a-c7c2-4422-a33e-8f60f887e81e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:40:55.038
2b3f00e2-fc9d-4776-8f45-0e48ef32112d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:41:55.032
be4fcf89-be23-41fc-b824-489628ab46dd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:42:55.06
adeb6056-af09-44a2-95cd-8279a59e2974	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:43:55.104
1da464ce-9e45-41c4-9e0f-48a4dee0fed5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:44:55.031
8ed4a6cb-7f07-4c3d-a1ec-aa712cf196d7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:45:55.025
97079a1f-2fc7-491f-aa2d-cb751c3a6114	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:46:55.03
46411b94-a50c-4f50-a1a5-c96246a47ab4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:47:55.021
d2ba94ff-50fd-48f4-90e3-fa55c7f2fdbf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:48:55.036
e346795e-4682-4b8f-b9af-05194d7096fd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:49:55.117
5c6401ab-12d7-407e-a7f7-122365fbb220	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:50:55.022
a3ee8079-fc5a-4b02-9144-34a019533dda	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:51:55.025
ee4db6b6-9a6d-4acb-ba94-9ddd3fcb6cea	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:52:55.022
a9b9de20-e02a-43b6-8f2d-e15d817f414b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:53:55.031
9b315b91-d2c0-4f30-a9dd-0a5776acfb37	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:54:55.024
b54b9650-1299-4128-9c63-c6b6f4bb683f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:55:55.116
a68d229a-2960-4501-9a66-cfdb6fa307a2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:56:55.025
49c62b4b-f8b2-4830-9a0c-856aecdc05e2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:57:55.035
722ba834-bd23-4094-9102-ff6c74876b02	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:58:55.02
1da8fd2b-c383-4ec6-937e-fdd2a827a096	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 09:59:55.041
4038ab48-8e2a-4b77-8e81-b8666549bb6d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:00:55.024
1be5eb1b-55e9-4f72-8c55-84e73196ca76	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:01:55.105
392f34b9-35ef-427c-9e0f-aacb3907e375	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:02:55.025
cfb28eb6-356c-423b-bb9c-18454297580e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:03:55.036
ebf4d1f8-9293-4dcd-a91a-18733bdfb3e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:04:55.033
14b942bc-15c6-4a79-a46c-9283f5e0ce83	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:05:55.02
0819fb08-4328-4cc3-861d-5f047f0e2091	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:06:55.025
c59f99ba-6c59-4412-9693-fa22108903eb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:07:55.115
18c9a4b6-16e0-4592-bf83-3212ad6aa542	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:08:55.025
38ee0da7-fcc4-48d6-83e9-c01425783dc5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:09:55.042
a106c41c-7bec-4123-9d34-7d73e2873928	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:10:55.064
129574cb-6a94-4adc-b68f-84fb9d21c8ec	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:11:55.034
93b4018e-8894-467e-97da-2dbce16fdf5a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:12:55.061
5554443a-32c4-4f61-b08b-ec8f5150df49	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:13:55.098
f4954446-2c0d-4605-a251-ff7a19f7f23f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:14:55.069
0df36345-fee7-437a-9e49-9133b447c2fe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:15:55.043
5e6e1f88-650a-4876-bc1a-7bbcfef4529c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:16:55.027
cb7c976b-26c1-4405-9989-e7f4d4bed767	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:17:55.025
4c27a0cf-d89c-4e39-b340-6d5d5805f674	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:18:55.027
86c6445f-f897-4c61-af04-ee31ca03a41f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:19:55.163
f0d46680-65da-4d67-8460-bb8b9729e936	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:20:55.03
0c6f4985-c6c8-4b5c-b6e9-d32f5257e24e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:21:55.019
bb57bd5c-6006-41de-a33c-79b2f3b1e2a2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:22:55.018
4dce807d-61a0-4780-9a21-f4cb5c9133e8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:23:55.034
e878097f-f9a0-46b9-b357-dfb2f07dea12	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:24:55.026
dea6e880-af7e-4496-84e0-712b1afd5eae	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:25:55.114
75d7ba15-5c5d-4d16-ace4-30e7aa4b70f0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:26:55.036
fe3a87ed-41ba-40de-b94d-831941d3a357	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:27:55.069
a967428d-2f54-43e4-9738-acba37f48a74	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:28:55.021
7e1b7000-e02d-422b-9df2-c95a5cac85c4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:29:55.041
b14a2fa7-e749-4288-8ae3-eb669e0f0d4a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:30:55.031
9710e8ec-581e-48a3-97d6-19ea6ad1b992	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:31:55.122
ce0bf63d-558f-4bd5-b22f-d9065f22b112	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:32:55.05
6a73c9ee-5240-4d94-95b2-6e0a0e52291b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:33:55.023
a00ca82b-486a-4556-b26b-b146b079613e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:34:55.024
3b732ba6-75e8-4d5e-ae77-28257865ed22	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:35:55.022
5befee57-f09e-4ee4-a917-e69ba5bb6a9c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:36:55.03
80b5a116-54aa-4586-b20f-57305952f8ca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:37:55.105
d777e6fc-f13f-4de0-9afc-e57c03208df5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:38:55.022
5fffd723-2a9d-437d-a80e-80290f287682	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:39:55.02
3df614e9-1a86-4500-b389-f009f4da8189	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:40:55.047
e9afc767-56ee-4ff0-8b7f-a86fbe3fcf0e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:41:55.03
7f103373-d4cc-44e3-a9c4-3a5475c49484	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:42:55.045
7c1df498-00e3-4e39-9cf7-ddbdc8c21564	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:43:55.121
69fe146c-f332-4b9e-a565-e85f4b1b174a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:44:55.128
df6e2586-e4d0-48f6-8ffd-a9835d3cdcbb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:45:55.023
bc5427ad-a0b1-495b-a747-3386e0086c07	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:46:55.059
bf6566f9-08f1-459d-8f64-26942dadfa14	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:47:55.024
5400dce2-75bd-45b9-8cef-daf4010ab78f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:48:55.02
02ca38f5-d64a-4e84-ba96-42fcb16a5e74	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:49:55.121
85a62855-5d13-4d32-a382-4ed8a5632e60	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:50:55.049
d885d3d8-d0f4-47fa-a0b0-2f7815eab2eb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:51:55.036
7fac680c-ebbd-44a7-8ccd-bdc91016bd2c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:52:55.032
77ed2d9b-0a81-430f-95e8-80ce60b56d19	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:53:55.02
28191b1b-94f4-4391-902a-e1b048348859	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:54:55.022
4f1b352c-dd29-4092-aa15-21f04708ce46	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:55:55.133
71e07e3e-fc1a-4ee1-85db-bbeafe714668	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:56:55.02
d28c1197-e677-40ba-acf3-cdfa8790a557	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:57:55.058
7117ce5d-80cf-4387-b90a-91bf0459a2ff	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:58:55.054
a0f7c76a-93fb-4068-9ec2-32456e4f29e5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 10:59:55.024
1e98e5c9-8a28-46b0-ad76-c674eb3b4587	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:00:55.032
d846ba3c-2c1c-4ff6-93b6-30f51ac07cd2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:01:55.122
3a42f931-d937-47ee-bba6-1ce558f9baa6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:02:55.02
602b8576-977e-44a9-88c5-321fe57b07cf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:03:55.029
debf201d-173d-4b56-8c0c-bc2f825f96be	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:04:55.023
afa89cad-0af4-4559-b4b6-1dc469c61529	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:05:55.046
6609ae0a-e4d0-4a37-9bb6-1af2ec6ed45a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:06:55.02
8845da0a-919f-4c82-bce2-200cf586a2fd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:07:55.104
b9952435-6d76-4e36-a5e7-eb7d48c48c9a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:08:55.025
680ee312-4973-42ae-875c-2377ae4372aa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:09:55.021
32c78fc4-92e7-4539-b691-23c96e55ecdb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:10:55.032
66ae14d3-fd8b-4720-9dd4-cace040c866c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:11:55.034
0cf1b8e7-45b1-4fea-beb4-e5656199b0a8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:12:55.077
1dcda70e-b989-4e6a-b393-2d5a2467d75d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:13:55.101
579a3fdd-e8c2-40e4-b719-910bab010cd1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:14:55.026
50a2ba90-2b13-493e-9304-9f1004c47edb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:15:55.026
30955c68-1d29-42c2-a25a-b885a6a3aeb4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:16:55.029
84c39c0e-b5fc-43d3-b16d-70ae7819f0f3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:17:55.02
adb71864-86b9-4c59-a3cc-064375c01248	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:18:55.191
4ac9fef8-b079-4600-8e5e-16e5ab4b4551	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:19:55.018
fa9249fa-0917-477c-9fba-75134bc2a706	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:20:55.024
77a67b28-7666-434d-9b04-429e6c0ca8ca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:21:55.017
84f27076-ac04-42b7-aa1a-5a14a8f0b7fe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:22:55.023
7f796131-8d7a-4dde-823b-9716fb19ab9d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:23:55.031
e0acb7e6-137c-4d13-9b44-5c12b0f4cd16	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:24:55.137
13045a45-529e-4b39-bcf7-0cab2f3d461e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:25:55.025
a299b3bc-f784-4634-912d-10318f257427	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:26:55.026
a3aa87c6-087f-4a73-b582-f10d6de284fa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:27:55.051
f836ec59-06ff-4e6f-89ce-f711ed59eb61	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:28:55.029
2f8eb484-0ffd-4413-8e51-1a565f5f301c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:29:55.022
c385f082-bc3d-4aeb-8121-95946ca16b71	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:30:55.119
68c12d1e-6157-4b2a-8e09-5ddfa7cec51d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:31:55.031
c1a1db7d-1116-425c-ba96-a8223d7bbe79	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:32:55.02
847a31c5-0000-4d3b-b25b-619ccdc02fa0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:33:55.022
d88320f1-7851-4e07-af7d-0183078e69d9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:34:55.021
3ecc218f-088f-41c3-8197-d5c0d43dba8b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:35:55.022
9037cc3d-7615-4761-a10a-db855cfcc774	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:36:55.115
7190ed26-0ee9-4119-a2a2-03c0a37f14f1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:37:55.027
a4b46c08-7a46-49a8-8c50-8a9c922a7c7b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:38:55.022
4268e0e4-b221-4324-b1c6-1e441c3d87f3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:39:55.021
a6b6a93b-279f-4e6b-94c3-c7c4f6c3b5b8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:40:55.031
d34c6edd-d5ca-4beb-ae09-75254d3d24e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:41:55.023
6d9bc0b8-5b49-49a3-911b-88193f92ee00	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:42:55.133
5983c1bb-e85e-4dd6-96a9-d2c6130be4c3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:43:55.027
f4557f54-5cfa-4793-91a1-b7728972cd2a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:44:55.025
e9f9987d-a138-48d2-b065-4384f4619156	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:45:55.022
8a63c679-0462-4808-a0d1-9e3030937be2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:46:55.027
7cbcaceb-6888-46b4-aa62-4adbf0e90d8d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:47:55.025
a4aa5af3-65fd-401a-adca-c3dbfa9d4b85	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:48:55.281
6a2175ba-3b1f-40bf-983f-26e09a32d2b7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:49:55.021
ed80f526-0c13-4aa0-9f2d-0cb66db47c6e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:50:55.027
8e049c47-4202-4a54-8bc7-f7da173d0241	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:51:55.037
3522a677-6ab1-402d-9195-1bc5eda09d49	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:52:55.022
45593a66-b91d-4ac5-925c-8976452ae27b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:53:55.03
f7515e4a-df8c-4d32-8c27-f644ee2ebe8e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:54:55.115
b02b81d3-aa7e-4596-bca3-8b10151bb574	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:55:55.025
f6397fd0-86eb-4d7d-b29c-80dcbe3eedba	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:56:55.024
065b5391-2579-4df5-9365-57fc09c65035	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:57:55.05
b1d19449-5389-4b39-9db5-d6918fe9de35	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:58:55.034
92f915dd-5ef1-4ff0-bdfa-28d817dc635f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 11:59:55.02
8d9ee7eb-e14f-42bd-a6ff-d88ccc0938bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:00:55.106
c4b7ea3e-3f0c-42ab-8355-09ac6438e1c3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:01:55.022
a8bb7ccf-5a12-4d8e-9afe-7bff6581c0c2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:02:55.037
78eb7d35-ab1e-4d53-bd07-68dde0b99244	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:03:55.019
e057660d-f9ec-4607-ba9a-ada84b964443	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:04:55.033
2b246311-380e-49ef-afd4-6f33519183a6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:05:55.019
ce2e2738-6e09-4787-8bcf-f682c1c92b4b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:06:55.199
aae32f8d-303f-45c9-83b5-caf6e2e93626	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:07:55.022
3c2e044c-3bcf-4098-8893-5b36feee4436	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:08:55.042
7c010400-ee7d-4d8e-9488-a10478c77154	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:09:55.022
3302823f-3c5e-4f71-bccd-e9bf237ece09	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:10:55.023
3eec8a62-09f3-43ce-8a17-04d30c9699d6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:11:55.018
6c20b8bd-a784-4d75-8bdf-b9d8dbed5475	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:12:55.239
3387822a-c2ae-46d1-91f4-4e12cd32d23b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:13:55.026
32faca38-618a-4214-943d-5783f88c32ea	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:14:55.028
3de74233-7c7f-48e4-a9e0-71899d4da219	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:15:55.025
902a2c3a-1c18-43e3-8010-50bd15a2ea29	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:16:55.026
4f927cc2-d3fe-4dad-b5ab-3181b0cba23b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:17:55.034
9c7f9c49-0db7-402b-a497-b6c65ed9f3c6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:18:55.142
b4f1feda-3399-495b-887a-5bd33813ac96	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:19:55.037
eb648f4d-edf5-4b23-96e4-4878a3bae022	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:20:55.033
0525d4af-85ee-4074-85ae-e64ae967048f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:21:55.04
bca0500b-00fe-41ae-a30c-e85924cb3884	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:22:55.034
aebc5600-9720-42bb-813a-cbe565c079bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:23:55.029
d2f2fc58-87c1-4297-9497-781f5e56bf6f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:24:55.121
3db15551-6440-4a81-af4b-96982cd0d289	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:25:55.022
fcec8411-4260-4696-8af7-c55e91a2e1f5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:26:55.024
a0192d04-a4ef-43ad-acbc-a39b4e79cb1c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:27:55.055
cc4c975b-386f-4db6-942a-5b0fa1f984d4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:28:55.02
bcace1f5-8a70-4440-a6ce-54ed18fef82c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:29:55.019
2c66e9a9-b8cd-4ae5-9f85-66589d31e37c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:30:55.113
da5251a4-d9cb-4dcb-923a-6c7adb096519	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:31:55.022
c96d2967-f69d-40ed-a9db-315b8aff0511	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:32:55.028
3cb397c0-5ec4-46a7-a281-d8d6ff4a251c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:33:55.024
33f1a6c2-48bb-4559-b3d4-8d00022b2a3d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:34:55.025
692ea745-ebdc-46f8-be7a-8d99ef353adb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:35:55.024
b79fc4e7-ba35-4a98-b124-812801fecb74	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:36:55.097
e8f32e3b-c10e-4d81-9a38-4461327b8e4b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:37:55.034
9fd82d43-b08d-4e22-be2d-7d182dc24d7f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:38:55.169
651607b9-fbbf-4ce2-9741-f50299b97e49	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:39:55.022
a37d2790-fdce-4030-8f49-9a8e8d07d1b4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:40:55.038
c37f3b6b-e4de-407c-9dbc-1af86ee6c896	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:41:55.038
b01c7fee-5b8d-422c-a74b-96037cbb0745	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:42:55.205
795120a8-3a24-4792-a0f2-d2415c754503	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:43:55.096
12b29893-2384-4b68-a0c9-cf304264749e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:44:55.049
238e0d4f-1313-463c-b6d5-2924feb9ba46	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:45:55.041
cbfef906-8601-4993-a8de-782e77044d04	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:46:55.034
c3c5c058-f4c4-4099-bc5a-65bfd336c7ed	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-20 12:47:55.066
c88ce089-c392-46f8-9b78-7bfab669dadf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:22:01.222
5be3e081-1ba6-46a9-8092-e266b569bf8c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications?limit=10	GET	2026-05-21 04:22:01.318
8549c216-69e9-454d-b8ae-c67752edca0b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-21 04:22:01.321
17061fa7-f983-4fef-aba2-bfc44f81d6b0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-21 04:22:01.498
90b8306c-5280-4783-b93a-981a18d07ad9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:22:01.494
0fb2d794-f387-45a4-8b6d-8c7717d04c5e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications?limit=10	GET	2026-05-21 04:22:01.501
076d768b-7bce-4d93-8f0f-f17739459560	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications/read-all	PUT	2026-05-21 04:22:12.931
9f6ac32e-3826-4a76-bfda-73870da8b53c	\N	LOGIN	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/login	POST	2026-05-21 04:23:47.055
dd4bbec3-997d-4990-9039-6acc88315ae2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:23:47.092
d91e450f-0ae3-4057-8106-5c00ac0a8f58	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-21 04:23:47.097
4347594c-57b5-4fc3-a067-896192b25070	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support?status=OPEN	GET	2026-05-21 04:23:47.748
a674485a-0a56-43bf-9984-bf585a11c2c6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/overview	GET	2026-05-21 04:23:47.852
75c6f8c7-3c89-4828-92e0-b10f5a74836b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/category	GET	2026-05-21 04:23:47.912
5113e03b-cca8-476c-8c96-cec0cd111e53	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 04:23:47.863
6d41d1df-e193-45f2-87c2-86f2c6c6da81	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/orders?limit=5	GET	2026-05-21 04:23:47.867
af66abf4-d6a7-45c5-a247-e87a3aa1136c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/top-products?limit=5	GET	2026-05-21 04:23:47.892
52c7ebd0-78f8-4f28-a945-cf20b7b612d9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/overview	GET	2026-05-21 04:23:47.909
9461d6fd-2496-42a6-a250-318a8133ced0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 04:23:47.916
ebdc895d-b51f-40ac-aad6-9a68fec064bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/orders?limit=5	GET	2026-05-21 04:23:47.928
3b0161e1-29bb-4bcd-acde-3ca52a99a9cb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/category	GET	2026-05-21 04:23:47.953
cbac051c-00c2-43e7-8eb3-44aae7c0d3c2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/admin/stats/top-products?limit=5	GET	2026-05-21 04:23:47.949
dda18b5e-9504-40a5-86b6-ea9865b290bd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:23:52.371
5cec1d6f-a337-43d1-b15a-4739ba620b72	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications?limit=10	GET	2026-05-21 04:23:52.379
f5652428-64f8-4864-abb5-7f550e56ef65	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-21 04:23:52.386
92738163-bf64-4275-8d45-fe00f06d64aa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:23:52.401
8362ccbf-a0b1-4050-a489-c958165ed1fb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications?limit=10	GET	2026-05-21 04:23:52.416
0ca119a9-4880-4a8b-85b9-5df5a2a35fcb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-21 04:23:52.42
427abe42-d348-44ba-bc84-c63a090c1931	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 404	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications/7c3292c1-8261-4341-bc46-89aa18ffb63f/read	PUT	2026-05-21 04:23:58.17
30636a4c-123c-4b89-a66d-f7e459d7c4a3	\N	REGISTER	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/register	POST	2026-05-21 04:24:45.913
6ed01112-a780-475e-97d4-a1043dbdaf74	\N	LOGIN	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/auth/login	POST	2026-05-21 04:25:02.334
cdaf9916-ecec-4415-9a27-5d2cbdbcca57	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-21 04:25:02.363
195836b0-3f13-4d90-a3b3-9ff5a1d9502e	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:25:02.365
7d5a6a6f-8226-4ee8-823b-596e056f40f7	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications/read-all	PUT	2026-05-21 04:25:06.507
de51c3b3-6ee8-4689-8755-d800d8ce07d0	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support/my	GET	2026-05-21 04:25:09.869
b116b25d-7327-4101-b9b8-47a99e138f55	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/support/my	GET	2026-05-21 04:25:09.886
ff7b1ac0-3181-49af-a043-55a59047eae0	\N	LOGIN	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/auth/login	POST	2026-05-21 04:25:58.048
45cbcbc5-9904-4007-b725-3e718ea31148	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/cart	GET	2026-05-21 04:25:58.075
8f0e88a7-6f72-4c42-b643-21a3db1264c2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/notifications?limit=10	GET	2026-05-21 04:25:58.079
e126397f-1783-49fd-b3d0-de23e0c246f2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/notifications	GET	2026-05-21 04:25:58.085
05de3ddd-c16e-4aed-a3aa-02d3c302d86b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 04:25:58.591
924d2c39-632d-4bd1-95ff-e0fe13f92d58	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 04:25:58.644
8f6cee9f-d4b1-4281-9c0a-220db065705c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 04:25:58.594
b2d3a7c6-e09b-407a-9f9b-53a82a5d90bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 04:25:58.612
63344f92-9f98-4e6a-97c5-79fa2ba46e61	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 04:25:58.607
20a5b69f-b44f-462b-8078-8f7df9bf0fc9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 04:25:58.623
d200e631-51e8-49d0-b9c4-d29c03a3bb63	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 04:25:58.634
bb409c2f-f74c-48f8-be3f-53d0fcd3dc7e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 04:25:58.642
bfe88b76-9915-4fb0-a294-e23bc1055ab1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:26:24.431
de5c6eb8-f449-472e-bba3-e306b5cb11c9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:26:27.404
32e3a908-aa55-458c-8737-88c9a080d77c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:26:28.573
ea9588a7-f15b-482e-8ea9-f8d1c33aa077	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 04:26:57.634
f1dd2605-1ba3-449c-90ae-cbfb4ea2eeed	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 04:26:57.683
24552ebe-e16d-4d73-837f-ba02e3193b30	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:26:58.561
8633359d-ba25-4f5a-94df-56e221a83e1d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:26:58.903
15bdcbad-d8ba-4f34-838c-061af51470ee	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:26:58.914
116851e8-9d06-4266-8de2-d16c09b7df94	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 04:25:58.621
4970e60b-db6f-4771-8443-18253b241b7b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:25:58.61
ab4f9a77-7129-4182-b1b4-156526ae125d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:26:24.445
b061ed81-ec92-4397-81ab-281ed4d2f7bb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:26:25.688
73f30664-8604-45fc-ad03-8e137b80cde4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 04:25:58.661
cab0363f-cde3-48af-9c58-4bc0f494f8cf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:26:25.7
dd39e664-f49a-4538-bd20-93bf286a1343	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:26:27.384
84d2f725-a9a2-46bc-8c09-7414de97132e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot	POST	2026-05-21 04:27:19.846
80e735f8-4d0b-48da-aca2-54ef96eaf361	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:27:28.563
e0140044-d05d-4a87-bbd5-dd613e1d1c43	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot	POST	2026-05-21 04:27:53.278
120922da-22e4-4980-b45a-5a0fea2c321b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:27:58.554
ad7ecc87-bc9f-4ed2-9036-3e2fbc4f761b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:28:11.928
a3dd8b08-bfb7-47ec-a9ff-f2668b575822	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:28:11.942
0338a056-34d5-4cd3-bae7-59cb8741eaef	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:28:13.702
ddf52c87-dda4-4eea-85a2-eb9f37001020	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:28:13.714
85fb8b90-d21b-4bf2-a98d-9fc41e66485e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:28:16.599
6b06c6a4-2bc2-4245-9604-c3afa78e7a95	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:28:16.611
c06b0b26-4549-45a4-9f27-4d5146cd1287	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:28:28.58
869a513d-5b75-444e-9405-e4506460f1c9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:28:58.564
9f4972cd-f2f0-48be-8abc-27e9a26bbf64	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:29:29.357
12515162-bb5a-42c5-b41a-1c293eba8e8f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:29:59.346
ab372611-4567-4ebd-ba76-2633905013a4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:31:09.354
a712b00f-485d-4aa5-a6f9-6a5aa8d2afac	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:31:51.568
e29239bc-dc68-4f4f-8e2e-48eaf2c6026e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:31:58.574
3c67f54b-503d-462e-b845-6e547f640de6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:32:28.567
8d6056da-d216-476e-b9fa-d0e06faaa885	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:32:59.374
d683ef42-47fc-4928-96eb-26247f36be78	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/77aacf49-8a00-408e-81ed-40f544bbf382	DELETE	2026-05-21 04:33:07.093
999be6a6-2657-4fde-98d7-73510bc0186b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/63594916-a8c2-471b-a92a-8d1ef601c8b3	DELETE	2026-05-21 04:33:26.718
a40829da-ce4c-4d79-a0e2-0af4e25762a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:33:28.56
f02869db-0305-4fb5-ba6e-19ed06cce34d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:33:59.354
a958fe9c-e370-4e8c-b201-e123fb108a27	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 04:41:31.034
3d39e3fc-e409-462e-a21e-bb7931246330	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:34:29.339
26587ebc-58d9-4c3a-b80c-b8fac6c00653	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:35:09.379
68f4c93b-4e82-44dc-a108-4f7e67daeff7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:35:33.302
e735d42e-ab8b-48e2-b7fa-89212ba477b2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/categories/e7146aa8-38a5-448c-9838-4e2ac2531e46	DELETE	2026-05-21 04:35:50.945
aca7afa5-c6f8-4a6a-8ed3-24455d61d3fd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:35:58.563
49545fca-384d-4238-b1f5-e1cf3a237696	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:36:33.196
13d349a4-050b-40f1-8726-787af97a771e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:36:33.214
18108ba0-8f4c-412d-9af0-9a32a862e30c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:36:54.653
a5ae44c0-7f08-43b7-80b0-d44a17ed5c38	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:36:57.184
4816477d-a42f-415b-8638-19bb7cdc0ba8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:36:57.215
a6654c16-6ac0-40ae-a540-8a7ca09a3ce5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:36:28.571
feb91860-7d9d-4bb5-9e0f-9b0b76c37fa0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:36:54.672
f3921af8-41f5-4827-ab2d-750a90092619	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:36:58.566
d4106b13-73a8-4ee3-afed-856242e152de	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:36:59.075
8c04003e-b333-4520-86d5-90c3625febbe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:36:59.107
57bdce1e-040e-44b2-8e72-e41773fb1e91	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 04:36:59.916
c7971bdb-addb-4b7c-b279-bfa1e5069f36	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 04:36:59.938
144097f0-3730-4660-ade6-1c19944ec07d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:37:00.903
c2e06ec2-d24d-4d09-89fe-17782f97738c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:37:00.925
2b783c11-81fe-499b-bfda-d742f9cdebef	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:37:29.361
983b4ffa-6448-4be7-a873-cd29e7bcaa86	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:37:59.348
d6b859cc-1c08-4505-8026-706cb19a2887	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:39:09.354
4cc88e79-6c77-4d0a-b66f-ab50fb6b9526	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:39:28.574
bc3cf4ac-338c-4be0-b8ab-1bd048f082dd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:39:58.573
07edf491-a3f0-4f1a-b056-514d36e1128b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:40:28.559
90eb4ee9-58d6-4fd6-9a93-8e012c6e06ca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:40:59.376
d16137fd-789b-46b2-a7c5-2402b974f996	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:41:10.581
c02c99ca-39fc-475f-a9d9-45859e7c46d9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:41:10.614
c6d19d9c-406d-4b84-993d-ae4b81db913f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=SHIPPED&page=1&limit=8	GET	2026-05-21 04:41:15.871
bc8a282b-a029-4e5b-a360-fe940b025779	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=CANCELLED&page=1&limit=8	GET	2026-05-21 04:41:19.043
53621178-c94f-4d17-8cd1-b0634d226b80	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:41:22.345
7b5c058e-18e4-4516-a495-a4d722f66610	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:41:25.435
8bf8108b-9de0-4f14-a066-c7e39d90fbee	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:41:25.45
fb2e8f97-9ff3-4970-8b66-04ac295ee3af	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:41:26.896
6ef421b6-d00b-4153-932a-e1841c3c3772	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:41:26.919
7419e2f7-161f-4bdc-aad3-104f8e3cfc1c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:41:28.563
c3f1891a-d9c7-42e0-89e1-f51a1b05cd45	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:41:29.762
5bff19c8-5217-4f98-b44e-a12a1a516a0a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:41:29.773
879ac513-d738-464e-9159-c6112bb9226d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 04:41:31.014
bf798684-dbaf-4583-a781-4680ffa157a1	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:41:51.427
0d975c83-8387-4f89-b83e-2eccd492d036	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications?limit=10	GET	2026-05-21 04:41:51.494
69f4a12b-b9de-4b9e-8add-650f5ff4c1c6	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-21 04:41:51.496
ef5ddd6a-12e5-4feb-86db-379f0f66304c	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications/read-all	PUT	2026-05-21 04:41:53.769
c977d48d-fe68-46fb-83a2-8f21a8c8c353	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:41:58.569
67f49e7e-bf6f-426f-8c71-d2bb2d981f9f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:42:28.572
27957635-4633-4d93-9983-3b2f89088469	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 04:42:36.365
0e986da2-e527-4c14-b29d-ede66da438ba	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 04:42:36.398
9ebe3432-dcb6-4524-866f-9e992e0763c2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:42:37.109
0adfc3d0-af45-4399-8271-3648cf281f12	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 04:42:37.132
f287ae9b-95e0-4ff6-baf2-e47aee2900f4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:42:39.671
142b784a-bdc8-4c7e-9ddd-e2fa459880f9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/vouchers	GET	2026-05-21 04:42:39.695
831d2a22-25bd-470f-8c95-a24505f949a3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:42:40.616
f0dbfe76-acf8-4844-aada-b0fbce30ffc9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 04:42:40.629
4fd40418-0a86-4b35-9d5f-bd0713f5db36	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:42:42.69
ecb9debe-f3e6-49c7-8721-efbb9b88ac42	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 04:42:42.707
3c33f162-297c-4e1e-910e-ea40a3d56639	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:42:59.345
fdd609cb-af61-45e1-8c4e-5c955307791c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:43:29.36
afde90e7-d2c6-4180-9909-507ceddf92b1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:44:09.361
1efdb0ea-87b6-4431-b91b-d1cb602314c4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:45:09.38
1cb34d57-841b-4f7c-90df-64d5b13ab94b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:46:09.358
fd710369-a7f1-4b00-b16d-d079d5b2f21c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:47:09.458
22dd7637-150e-4681-996f-74bd3bdf88ae	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:48:09.363
ed4d263b-a4c4-450c-96ff-0cd953c90e0c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:49:09.362
d8ce00c5-1d01-4fbb-baf3-3287b4f6f9c1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:50:09.347
25d8291e-e77e-413f-bedb-7700fa60045e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:51:11.167
7df5bed5-dcc9-4903-a82d-b35cf794c25b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:51:29.422
224f59fa-0a11-4c4f-9b06-3a75c7bdc4ba	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:51:41.204
8709c037-7cf9-4b9e-861d-6d58d369a1b6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:52:09.368
d4757895-9de6-46a5-8f5a-2de25d0424e5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:52:59.42
bdc6ee8e-e24d-4289-b3d0-078c7e5190ca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:54:09.354
006998f0-1538-4548-9606-c01d470fa441	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:55:09.355
cd5f21dd-2dea-4b3d-8f78-7124399e444c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:55:16.737
a05ea45e-4007-4bd5-829e-435c6a479537	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:55:46.645
3509b524-0e11-4041-8afe-9e974209c2e3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/settings	GET	2026-05-21 04:55:52.516
0609a47e-1337-4425-8535-46c3b070c75f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/settings	GET	2026-05-21 04:55:52.526
9815922b-f5ed-4fbe-9516-a46ceded1f0b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/settings	POST	2026-05-21 04:55:56.951
9a2e3d53-aafb-4078-9c01-d0ca8dfcd86f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/settings	POST	2026-05-21 04:56:36.787
9a483ac8-8ebd-4ad6-b73f-9d3db2b64364	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications?limit=10	GET	2026-05-21 04:56:46.652
5acfb459-d9af-43a3-ba6a-5d1c6a2d97c7	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications	GET	2026-05-21 04:56:46.649
bd15e3db-77ca-44e5-afe6-5a2e6d41f7d2	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/cart	GET	2026-05-21 04:56:46.706
3f1e2e52-a23e-4674-a1a5-328f7364b642	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:56:47.37
e4fae794-ce70-4b37-b55d-95845d4b0636	69a87fe2-5f3f-4ab8-a09b-19c472c0f789	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	/api/notifications/read-all	PUT	2026-05-21 04:56:48.733
b35ef6c4-77bd-4597-884c-51c7d80c8684	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:57:17.361
e067beb7-2586-4974-a466-70456f08bc92	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:57:47.355
1231e80c-23c5-4620-898e-65362df03784	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:58:17.359
ffa41d43-e49b-4881-bff1-54c45add4575	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 04:59:09.375
a2b5cc98-af20-4ee5-8a00-0bdcb2e7dc13	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:00:09.357
9b9bb632-202e-446b-bb2c-339a132a93a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:01:09.375
2764ef31-58f6-4466-899e-e3ce4157f5b8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:02:09.434
f224ffe9-9da6-4d06-98cd-2236ed43c406	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:03:09.369
83b27e69-af4c-4c25-a368-55545c0524a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:04:09.368
345a543b-5571-4809-8c3e-a14f516a9675	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:05:09.35
40f937d8-ed41-40c6-9c5c-16f62d154307	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:06:09.366
f82f72c5-f1cb-41a9-80d8-d449a3a84d10	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:07:09.357
17245925-1269-41b0-a34c-ea569744decb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:08:09.437
5a4e9f7d-adf2-4895-b8f1-d05386d6d796	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:09:09.353
62919caa-b4e2-49d1-8e5e-77d41022d248	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:10:09.353
1a494eb7-d6f0-4b30-87ec-35bb2b335a87	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:11:09.354
e6f89dd1-5e6c-4199-bb4b-23565451a369	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:12:09.38
ea5bd13c-23a2-4fa2-a953-33fd0b103836	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:13:09.352
0eec8589-6b42-431e-8f6e-57c6459ba516	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:14:09.437
8a1a6859-2286-40ba-86c3-68d94c6074bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:15:09.343
68f215c3-fde1-464e-9ff2-1022077ee0c4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:16:09.355
dde8ba99-2b7e-4e48-b370-edfb97cda809	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:17:09.364
a44787af-274d-4521-a166-65c6d0617af0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/settings	POST	2026-05-21 05:17:14.193
e3f91bd5-d9fd-4d3f-b178-51a41be7f814	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:17:16.645
99b80ec3-cf0b-4edf-aef3-82e72d3620af	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/notifications	GET	2026-05-21 05:17:19.766
16986f5f-070e-4ed5-911f-621a612f153b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/cart	GET	2026-05-21 05:17:19.768
fe7a5587-fb9d-4b13-9c44-8ebce161c707	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/notifications?limit=10	GET	2026-05-21 05:17:19.776
40b2e9c3-bd3b-482d-b020-5da5c0e83d6c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/cart	GET	2026-05-21 05:17:19.806
f72d2f1c-ebdf-44c0-90e2-3d0524a5b281	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/notifications	GET	2026-05-21 05:17:19.815
ab8f4688-b768-4e8b-938f-f1e9027199fa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/notifications?limit=10	GET	2026-05-21 05:17:19.873
234fec4d-348e-405b-8b70-66bc0476764c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/notifications/read-all	PUT	2026-05-21 05:17:22.131
5dde8197-02cf-4f06-8101-0e3cb29169f6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:19:53.702
c832e1c2-d744-4fe6-bd38-6b702b4a6591	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 05:19:53.724
296c51e4-6520-4baf-9e61-5dcb1b735919	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 05:19:53.744
cf883e49-d583-47b2-a2eb-97b1f48975d2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 05:19:53.767
34f96568-bc01-4bf9-b414-951850c92df6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 05:19:53.77
632a4694-fbf8-4e48-874d-a8aa53c4b41c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 05:19:53.787
c595ddc5-ce99-48ef-8fcc-2f32004d39c7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 05:19:53.809
f8546df8-5686-48d6-90fa-0abdadea5c27	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 05:19:53.839
cc25c96d-e26c-4b64-affb-8bab3ee4fb29	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/settings	GET	2026-05-21 05:19:54.696
7b9baa63-eaec-451e-a329-8180654c5ef4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/settings	POST	2026-05-21 05:19:56.834
cd33d6c8-a4d2-4b75-89d0-da1faef72342	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 05:20:04.354
88506c50-c9e5-42e3-9c92-4ccf8251e6ce	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 05:20:05.394
d4f077cc-aa14-49bf-846c-174f0926b2bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:20:23.635
89218ff3-caf6-4a77-bfed-4d76bc34d25f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/251a49d4-f70b-48fa-b09a-106954f4167b	DELETE	2026-05-21 05:20:28.806
1ec2b807-6474-423e-bcf7-ca4ec4d41eed	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6bca5282-34cd-49c0-944d-a27cbef2cb81	DELETE	2026-05-21 05:20:34.137
6546c7b7-bc1d-4e0f-b0a7-fedb2086995b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9c0bf688-72f9-4939-8e46-6ffe827c828f	DELETE	2026-05-21 05:20:47.025
0c7f822d-d98d-42a8-a86b-27db842634b9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/cff34841-2d8f-4bb7-8206-ab2e53d7b238	DELETE	2026-05-21 05:20:53.119
92bd26dd-0502-49bb-951a-ad8969f6bfc7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/704ab054-cdcf-4c01-9bc0-797d350e3d3e	DELETE	2026-05-21 05:21:03.316
82096ce5-3fea-41fa-a983-b9656f903ea2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/b13fa5c3-9d89-41b6-8d59-38b43e86fdb0	DELETE	2026-05-21 05:21:08.848
8ec0b7c0-4dcc-45e5-9448-b19dd118ceb9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/68525700-505b-4261-b9c0-75d4cf990cd6	DELETE	2026-05-21 05:21:18.714
94930418-e4dd-415a-97a4-f48521e4f836	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6bb669c5-2e8e-4ffa-951c-ebdde73b2801	DELETE	2026-05-21 05:21:23.533
8a8bb958-2189-4b79-8c04-37e796666e5c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f647fc93-a285-4a51-9d44-7155f2d3b64c	DELETE	2026-05-21 05:21:30.71
951c8e3a-f8f5-453f-a4ea-b3f593274866	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:21:53.63
7c1932a2-5a2f-4272-8c5c-576ed27e6cc3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0127257f-98c7-4f74-9fdf-7307fa8cfda2	DELETE	2026-05-21 05:22:03.663
75aafe72-af49-458c-a510-77c47f1079c9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9c36dce7-9dde-4e5b-a88a-f8b70a98fcb3	DELETE	2026-05-21 05:22:08.152
3cbe7421-cdbe-4f29-92ed-d24ddb215f67	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/31473cd8-aec7-4491-af3f-e6a54d43743c	DELETE	2026-05-21 05:22:13.37
fdf82c2d-488b-46bc-a0a0-a9f97adaf8d7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:22:24.23
af2b7047-3ea4-44ba-992e-45138cf83afb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0db364ec-ba7a-4dc6-9422-4e05ec6e4c22	DELETE	2026-05-21 05:22:26.222
185ff6de-ebfa-414d-b91c-1e4c37e41468	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/2b8ca801-c4f0-41f3-b672-fbc1752a4890	DELETE	2026-05-21 05:22:30.693
192227c6-9a78-43dd-ae14-ad911e81f295	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/df893fb3-4656-45e8-b147-08a601a74397	DELETE	2026-05-21 05:22:35.131
99abd501-057b-4396-8845-011432bc16b5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9994f8be-4702-4c07-a112-20029307981b	DELETE	2026-05-21 05:22:38.929
58faf6d7-9b32-4d5e-b32e-aeb6a6546f11	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 05:19:53.826
b13a4112-97ad-4370-8357-2cb28ad67994	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 05:19:53.812
e019cc49-03e2-40e4-b7b5-4153207cb78f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 05:19:53.863
49f0152c-b31c-4fee-a8bb-764ab533ee8f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/settings	GET	2026-05-21 05:19:54.684
b992d8b1-c1f3-49d1-b671-d2ab03b7198e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/users	GET	2026-05-21 05:20:04.341
d419330f-abca-45a8-90d2-1fd98b7447ef	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 05:20:05.36
ff9ca690-74b0-450f-84d2-9b64cb6956d7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6bfc0a88-7093-4cf8-bafd-7c31096911b0	DELETE	2026-05-21 05:20:31.97
60721a5c-9fb1-41b7-9874-09094102c09b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/2668f42b-ea57-4cb1-aced-b190623c7c78	DELETE	2026-05-21 05:20:36.544
5a9c6a0e-9c4b-422b-8782-d69715c5667e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f3d82579-1420-47f6-9859-6fd9f6e4e78c	DELETE	2026-05-21 05:20:44.762
4afc5f4f-090f-438a-9ebe-5becdf55187e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/82bd02a7-1565-4e73-845f-d6e0bb4f8f55	DELETE	2026-05-21 05:20:50.125
cbf664c8-9457-44ec-9bf3-b0ac0a935240	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:20:53.632
48013759-35da-44fc-9be9-28876a1050bb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/96bc421f-f310-4a16-b567-3cdd7414e851	DELETE	2026-05-21 05:20:58.204
9f5b24c8-ece1-4cfe-a8e3-ae6f461d3f26	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/1446754f-6c06-40cd-a230-d31897853fb6	DELETE	2026-05-21 05:21:00.389
ce14f65c-8b7c-45b4-970b-cfa7db53afb0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/d17d1dbf-214c-4071-986d-2b871bfb4ef3	DELETE	2026-05-21 05:21:06.433
796f6a78-13f5-42c9-a3cb-96c653bd36de	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f2e415fb-a4dc-4b55-b395-9f22e341ea1e	DELETE	2026-05-21 05:21:20.782
d03cc41c-3d7b-4b0f-b1af-cbdb67927f9d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:21:23.623
2844d6fe-e56b-418f-924b-9da02fc78b56	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6a602538-c346-4c7f-83a0-74dfd0144851	DELETE	2026-05-21 05:21:25.784
43f5626b-9b21-419c-b4f8-98fda7ae9a25	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9a6fa825-48fd-4122-abfe-152bd1e4fa3d	DELETE	2026-05-21 05:21:33.09
f64470b0-a7d3-4122-97db-e59d42ac6c0b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/5243d74e-6903-4cc8-8b1a-57788ac8b0d3	DELETE	2026-05-21 05:22:01.776
e78fb6c0-9802-4bf8-a906-07c113f0681d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/cb51bd4e-65af-4e9d-bfe0-ca4f239e0bca	DELETE	2026-05-21 05:22:05.929
cc0ab639-bdf9-46bc-8bdb-9df2d90e1689	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c2870d0c-8600-4d51-8dc3-7d7da600241f	DELETE	2026-05-21 05:22:11.283
3486140d-eb70-4af1-9260-630c5c9ece70	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/900e6880-f601-46a5-a0aa-8395562489b4	DELETE	2026-05-21 05:22:24.228
038a1bfe-779c-4a0c-a77c-f21ca231e4a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/fb162570-a0a9-44dc-8d60-1daf4dc3ed02	DELETE	2026-05-21 05:22:28.039
ab2e39de-ffdc-4452-8010-81918ff47e5c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/ac1816e6-d0a2-4ddc-aeca-bf02a3b2465b	DELETE	2026-05-21 05:22:32.682
d119679b-b7b7-48e0-9a63-a0fc89757f54	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/5f58165b-79e5-4cbb-b8ca-9d85abc7eaa5	DELETE	2026-05-21 05:22:41.444
0ec0d034-20f9-4dab-9adf-d2993c61ca3d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f525f346-f654-4ce6-8f11-04f4e0697116	DELETE	2026-05-21 05:22:43.407
c3b66390-6d50-4a22-9789-adf87bbece9b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/ef34c4ec-0c74-45b2-bcc1-40ad3ddaa6f9	DELETE	2026-05-21 05:22:48.508
0c1878c4-b559-4714-a5ae-cce468ff8fdb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0662d2a6-7cd5-468c-bec3-e083b821a9ac	DELETE	2026-05-21 05:22:53.29
6e79daa2-6210-40e8-be47-f8526d17329d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/5628a9c7-d879-4874-aba1-9bf67fbcd25a	DELETE	2026-05-21 05:24:07.089
87d9f5bd-69a5-4f31-8bfe-e34312408158	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0e355f8a-c317-4083-87e3-6fa16800d4b7	DELETE	2026-05-21 05:24:15.112
cb7809f3-f482-4099-9e56-827eff3035ae	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0cc45078-cf86-4785-b597-e30dc6ba0290	DELETE	2026-05-21 05:24:20.069
3d90bc90-8859-44f8-b6b4-cf4a1f27eaee	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:24:24.33
a5fe13a9-5aae-44b4-8044-cbb1c21e4b56	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/3607071c-1d86-415f-aa3c-48caecd8bc24	DELETE	2026-05-21 05:24:26.152
d04d75fe-c739-4c21-8274-a4fc06b04064	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/2c2f6d75-ea54-456d-bbf1-aa0fcddc4101	DELETE	2026-05-21 05:22:46.496
dde0c3bb-9e17-4def-9ef7-ae1d1c3bbf4d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/5f66acd0-0d61-40dd-b871-0d6f8508941c	DELETE	2026-05-21 05:22:51.005
e5e2bebd-d155-42f4-b84b-90459a092333	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:22:53.622
af78bbb5-2083-4163-accc-01cb8b9251a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c9f7d6d1-371b-4186-ba5a-9a8a7de1dfd0	DELETE	2026-05-21 05:22:55.341
ce8de2a9-e8d6-4cc8-9281-8dc3566f9038	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e5eb6935-f2fd-46e8-9421-be28ee638957	DELETE	2026-05-21 05:23:00.966
59564229-e506-48f3-86c7-e76d9669144c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/19046e90-495d-4727-8e21-6a4d182f5056	DELETE	2026-05-21 05:23:05.441
f5b1e9ec-7c6c-47e6-8d9d-8a5483b36ed1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f212eb9f-7bec-4571-b2fc-8ca2f38b89a4	DELETE	2026-05-21 05:23:09.347
43d738e9-c459-48ec-9e0a-327779fe725c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/2583f7f2-6a4d-4107-9803-b4cff5546e50	DELETE	2026-05-21 05:23:13.588
7fa6f1a9-ca05-4ee0-b1d0-653fd4e83d8c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/83f1f3c2-9813-4f52-84e8-5e9223127f6d	DELETE	2026-05-21 05:23:17.961
40817d58-a646-4518-8d3c-a618bdad984c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/cec4d798-85e9-453c-bcad-e9f0685127b6	DELETE	2026-05-21 05:23:22.368
34dac56c-871b-4689-8a0a-73f2e5d170f8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/42417036-0992-400b-ba67-1acfeeea99cd	DELETE	2026-05-21 05:23:29.419
c8e0bb6a-1049-48f6-b682-abe471ce52e3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/5ccafe04-d44b-42db-a8b5-e6d92c13e8cd	DELETE	2026-05-21 05:23:40.67
6a6e6ffc-ff8a-4cce-bc6c-1f5d68ccab47	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6058612c-da6f-436c-a02b-6b37ac55edac	DELETE	2026-05-21 05:23:45.559
4ae9bff3-0dd2-4374-8517-3faa463d6704	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:23:53.621
d070ab48-18f2-49f5-b07e-e2381b9f01a4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/43c35083-d2ea-4291-8b0c-b4347d1c0845	DELETE	2026-05-21 05:23:55.646
56f1886a-661d-4729-925a-fe6507e2cd79	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/5ff2f036-5a46-4d49-a20d-71301cb735cd	DELETE	2026-05-21 05:23:57.549
ed756a94-7107-45b8-8113-9ea974aba441	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/7073c6ea-8f57-40fc-9490-3ac1c3c3fa2a	DELETE	2026-05-21 05:23:03.56
c43524a8-01c5-40dc-9200-2ae06b40027d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/1cb3b19c-aa02-42b3-b5f1-7d93318b02c0	DELETE	2026-05-21 05:23:07.381
6c5db2e3-2f45-4677-bdd4-fbc10416f0de	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/08d978bf-8954-4b05-af09-85cd31cd6baf	DELETE	2026-05-21 05:23:11.507
83d43a52-923d-4d5f-b220-8cbccce20666	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/d1f87504-4d78-4564-944f-d689956dac63	DELETE	2026-05-21 05:23:15.76
07d5fbb9-0cc7-4ba3-8e4f-538ee5060276	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/5bfaed1f-c48a-4e2c-afe8-cfaf46db9b2b	DELETE	2026-05-21 05:23:19.965
04fff8ef-29cf-4317-a7a1-4b2be33a3d74	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:23:23.629
84f4af09-89ed-43ab-9d05-56c15d7a39bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/70339174-549b-44d0-a0e1-9e539e1c8f8e	DELETE	2026-05-21 05:23:31.918
a7964b55-062a-4314-8432-890e71044a18	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/b255f76c-94f2-48dd-a4f4-8291e4005ca7	DELETE	2026-05-21 05:23:38.134
c2681793-3093-4a8e-abf4-802cdba891c5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/d25d093e-3916-4fe5-989f-32247fcc1839	DELETE	2026-05-21 05:23:43.154
32617bbf-d572-4c05-aba3-c8d18505c53a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0c37f68e-b199-4ad1-a33d-9009fe0e617f	DELETE	2026-05-21 05:23:48.13
194d041d-df2a-4303-8b4a-b038bc74bfb5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0162253e-0b20-4be2-8a52-7298a6aaa90c	DELETE	2026-05-21 05:23:53.486
efe282fc-75d5-409d-9d2d-bf24dfb468e6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6f3cc7db-6290-4b2f-a5eb-f12734d37ee6	DELETE	2026-05-21 05:23:59.378
3e8c266b-659e-4e71-938c-5921a0384f86	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/34bf28fd-05e3-41d8-83a3-eef7933b61d5	DELETE	2026-05-21 05:24:01.79
a96a4159-a3cf-4562-89fa-d76a9c8a6d78	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e3db4164-042c-45ed-a8e4-07d34c0e26a9	DELETE	2026-05-21 05:24:04.98
fdb6e70e-d4fb-436f-8e03-39f7d26717fa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c9d02e55-8a35-48c3-a907-94b34b770115	DELETE	2026-05-21 05:24:17.325
7425bd19-ad49-4dce-bb85-d07aeb2c2ed8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/93978d6e-c28b-47ba-8b69-4f14dd0c8ca4	DELETE	2026-05-21 05:24:22.473
5b16bc4d-9f4b-4f2f-838f-0eb9eca4e447	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/416d429b-73e4-4931-b934-7cf4d15bce7c	DELETE	2026-05-21 05:24:24.333
e7edf302-72c3-42d9-b43e-3fa991f5a597	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/d9a50ac1-04a0-43c6-bdc0-e55e00ec5fd7	DELETE	2026-05-21 05:24:27.958
a1e91249-5787-47cc-a4ef-228345b905e2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0c644bb8-9855-4fc5-b6ab-3c7e7dd3b376	DELETE	2026-05-21 05:24:30.007
15cc16cd-ee9d-4e9a-bc34-23879dedfdb0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/efce05e4-6bba-4c6b-9d35-41987cf95f11	DELETE	2026-05-21 05:24:32.105
34c78d03-2de4-4905-a20c-e61fcaf9f84b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9dd3c0b6-6dad-4aef-8f1b-86154d9cef3a	DELETE	2026-05-21 05:24:33.949
4f4c2031-38fa-4174-b82a-9011473cedc0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e78719ec-5937-4653-8289-c43212d70b0f	DELETE	2026-05-21 05:24:36.183
db80ef4a-0c8e-49b5-b07d-d925031f1453	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/403e9cca-8bbd-4758-9004-dbf0d7a5d1f8	DELETE	2026-05-21 05:24:41.368
e8718386-3496-48fb-a56f-222c3ded1613	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9338cee7-7a70-4822-8b89-0a2d22301f9f	DELETE	2026-05-21 05:24:43.491
468146ca-33a9-4242-b5fd-5797366ba42a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/3ab42bea-8a06-4b0f-8c2a-f9025555c544	DELETE	2026-05-21 05:24:45.255
40f7a05f-e74d-489e-99cd-a0fdd1f41670	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/1b761fbe-dd8d-4a92-8aa5-f910f92b26f9	DELETE	2026-05-21 05:24:49.719
4f891d75-a5f0-4917-bc59-70a43dace883	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:24:53.62
50a40325-d21c-4dea-adee-ac8386673103	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/325bdc4e-64ec-4c73-99b9-51ebd7798fae	DELETE	2026-05-21 05:24:47.44
aacf7d7d-4e3f-4fa4-8cad-0cf3115c1c18	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/d0e54235-f1b8-4f74-bacd-8df5a499d6c8	DELETE	2026-05-21 05:24:52.439
3e117ca6-304f-4377-bfe7-7b12c07d1769	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/4d2a8759-ff2e-4b5c-a730-47d1e36a36c6	DELETE	2026-05-21 05:24:55.023
b0ba3d06-9474-4ddf-a2f7-6b590cc12f7f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f4e83d52-4af8-4286-a462-bd1183d2495b	DELETE	2026-05-21 05:24:57.378
4a2dac8a-129b-4133-85a9-ecef15e54913	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/8acdd7ed-a499-41ab-8ede-53ee2e75689e	DELETE	2026-05-21 05:24:59.401
33f4f297-b8c5-4aea-b867-63a23100941f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:25:23.635
a707e468-b64d-4158-900e-c6413c64e97a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f1b3e725-37da-4824-80ce-0565553b38d0	DELETE	2026-05-21 05:25:29.797
0690541d-6d17-499b-ae46-38ce3a6199ec	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/a5ce8955-a820-4690-9730-1f1016ba7be2	DELETE	2026-05-21 05:25:43.36
fdd73079-6398-4a3f-8196-ea9777876f5f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/60f34e45-e552-41de-b148-776d89bbb1c2	DELETE	2026-05-21 05:25:51.441
404695be-2082-4205-801b-dd0ee31836e9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6d939b11-3400-4851-8798-c5af2ef9bc6f	DELETE	2026-05-21 05:25:54.338
551c1aa0-37d9-49d9-ba06-40475fc2ea58	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:25:54.341
e745c26a-019e-4199-ac4e-e953d3fc55f9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/be6d7c2f-c589-484f-8b41-5d914672e99d	DELETE	2026-05-21 05:26:01.904
81353658-44ee-451b-9392-c71e5bf9b1b7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/49939ed2-e967-4f78-8e5c-33c6d97274c5	DELETE	2026-05-21 05:26:04.861
dde77e22-1986-4c85-a335-4e1047d47d40	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/b57bb24d-8f74-4be7-9a9a-5f624c4e0557	DELETE	2026-05-21 05:26:08.829
6dd5b30d-3e28-4b70-b091-8595e3a4e622	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/730b78ae-ee3f-47f9-a054-a15d1c7e6616	DELETE	2026-05-21 05:26:17.696
738d82ad-9b3a-4006-bca0-1288342a802f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/656cc562-d4ae-41c7-8a53-cbb5693ac6ac	DELETE	2026-05-21 05:26:20.91
f9ba5417-2086-4942-bbdd-34a41699a920	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/a5688614-5070-40c6-b4dc-e8ab37e25140	DELETE	2026-05-21 05:26:23.077
77fc10da-ed2b-4ecf-afbe-1164e9f9cdfd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:26:23.628
28fa38f9-28b4-497c-ad5f-40af649b7703	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/eba9fe92-8a14-4a03-8058-ca489b3c38f9	DELETE	2026-05-21 05:26:43.274
7d705bc9-a2e3-4bb6-986f-e1346536e116	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/fbd5630f-8939-480e-8e65-c6df8ccd422c	DELETE	2026-05-21 05:26:45.684
f2cab362-2e97-4abe-9a37-b14464bb202a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/51df49aa-1d08-4b65-b3a5-4e187ace529b	DELETE	2026-05-21 05:26:48.473
d5a43b87-4158-4a03-82bb-9e2b1d6adfcf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/1e510fb8-52d7-4fb4-99af-ce562d0123b1	DELETE	2026-05-21 05:26:50.695
25732ff1-f852-458b-a81a-961b4e13c51d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:26:53.617
70e70277-cfa4-4b90-a83b-a94232aac006	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/cd19a6e4-7ea2-4c09-bdf0-4258e3212a2f	DELETE	2026-05-21 05:26:59.067
cc962322-27fe-4cd5-8ffd-7d54adaf64cb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 05:31:45.376
bbc7ca24-8d9c-46b6-b29d-f365194ba6dc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/658a340c-b94e-4026-82ef-3f711b0ce014	DELETE	2026-05-21 05:27:04.282
849e34ac-dd46-4387-a246-60ece45c375e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/920a782a-881c-483a-8c15-0baa102e3364	DELETE	2026-05-21 05:27:13.101
c9b97615-da63-4afe-b1a0-95badf7b2b86	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/58a12567-0339-4086-b9d6-784b3fb0209b	DELETE	2026-05-21 05:27:23.419
05b2810a-a004-4e3e-96e7-812b9b6203b6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f862db61-5b7f-4366-8e1b-dea238838893	DELETE	2026-05-21 05:27:31.088
7dab4c4f-b4ef-499c-8319-edf30924066a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/63ad3fa3-6e64-411f-9d31-0abe18652807	DELETE	2026-05-21 05:27:41.379
f8333d86-cd89-42b9-9def-901618293666	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/5b54a5da-1b2a-4b68-888c-8c54828eef50	DELETE	2026-05-21 05:27:47.799
e076b234-e0be-4aaa-8b04-1b81e331bf5a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:27:53.626
c8465fa0-7fa8-45e5-973d-929e7837878c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/05115d1b-ae62-46fe-900d-3d5792b8eb2c	DELETE	2026-05-21 05:27:55.849
b74ad99b-ca49-490f-b12e-1cf0446f4615	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/36375464-13d9-452a-bf52-9a0e784112aa	DELETE	2026-05-21 05:28:19.788
05463404-23a8-4ed1-8194-498f7b692614	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/3aa965e6-3cea-4e4b-a718-75beae98304c	DELETE	2026-05-21 05:28:40.094
551976ee-42d4-4991-a041-04c83eb9b725	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/8edcecf2-a85e-443d-9b2d-85ddc31c62df	DELETE	2026-05-21 05:28:53.421
fbb6bc35-76a8-443f-b8c9-580d7f7052ef	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:28:53.624
24f76d1a-7b74-4918-bad2-421f8cac4f4f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/1d6094d9-ee53-4dce-bfd0-97374e9b2185	DELETE	2026-05-21 05:28:56.287
b371fc7d-7b03-480c-bf92-e986a7b81db7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/dbc797f7-e4eb-4583-9a3d-1f58112fb3be	DELETE	2026-05-21 05:29:02.542
a6e7d965-a502-43e3-8d5b-46a54cadb6d4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c1db9318-7870-439e-a084-5f0e6f36805b	DELETE	2026-05-21 05:29:21.246
557980ab-10fd-434e-923d-89ab8f0074cc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e97ae160-81a3-443d-8ea4-1e44b70ff160	DELETE	2026-05-21 05:29:51.322
57090531-e8bf-4914-99cb-6add03c0d47b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e29cad95-69f0-4f69-a0b6-e7520b6c0b2d	DELETE	2026-05-21 05:27:16.464
caa1ada7-b4ef-4b64-bff4-500117b23174	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/4d81807c-5ab1-4590-8d8f-4e270425ff9d	DELETE	2026-05-21 05:27:19.02
efedc464-3c89-475b-8148-def9e6f05ea7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:27:23.651
8b2b8c4e-6461-40e1-bf56-b7774acdd126	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c68c5923-9de0-40c2-9722-9b65729ce777	DELETE	2026-05-21 05:27:26.317
2a7ce36e-a219-4616-9789-6ce759f9458d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/16faa09e-4c4d-47be-a424-e8f4dffce400	DELETE	2026-05-21 05:27:43.65
662d584f-df97-458e-837e-765276719caf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9583b3a9-efd9-4cff-8912-652bb1fef478	DELETE	2026-05-21 05:28:12.4
cbbb9cf7-495b-4a76-aea5-3e9878004695	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:28:23.621
90fbecd3-2705-4847-8c9d-0212e4f6159c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f8905c7d-e795-434b-91da-fbc1b8fc6d4b	DELETE	2026-05-21 05:28:59.129
c51f79ba-0696-4c2b-b521-d98babacbf02	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/b1a6d4f4-2eb1-4d9c-af71-e2bfdaf254e6	DELETE	2026-05-21 05:29:05.317
b7df4702-707f-4a88-8e14-c36ce52be6b1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/4eb74101-2c54-44cc-9458-b28d3e90534d	DELETE	2026-05-21 05:29:19.091
9f64ba69-4a45-41e8-8a95-c782557d0d8e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:29:23.624
c45d1408-b9fe-4dfb-9062-30bb2e0c9f8a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/32b7499f-828b-414d-903a-8749538e0af2	DELETE	2026-05-21 05:29:26.499
be63ec8a-51c4-4750-af00-78bcf374f265	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/cccb4b33-edf3-45ac-be49-c5a12a1bc999	DELETE	2026-05-21 05:29:47.171
dd1c9735-c2de-4dea-9db9-c87f844912fe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:29:53.631
20081009-ad89-4af8-a01d-5728ee67c9ac	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/99cf6eb9-7785-4888-872e-38a9a4df146f	DELETE	2026-05-21 05:29:55.408
9c44fc3b-b0e3-45c8-816e-7e1a204b0f62	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c3fcd4b4-5964-49bb-9e46-1cfd23e2b53e	DELETE	2026-05-21 05:30:00.949
3fbd7030-b9ff-45f2-a24e-c1e3e88d2f54	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/2d4907dd-8e95-4e90-8ace-0e636522d68f	DELETE	2026-05-21 05:30:10.065
f3780c49-ad08-4af8-8b15-34aa8334c58b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/7c6578b9-82c9-4104-bfd0-caf589fd80ca	DELETE	2026-05-21 05:30:21.552
b5bb24ee-d277-4faf-b9a5-8d38b6b6fca1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:30:23.644
683f1c2d-d269-4425-b90a-2194c1501e4c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/a12a086a-2bd6-4bf0-a9f8-9a41e051eac9	DELETE	2026-05-21 05:30:29.002
5c0e7ca7-c494-46fa-8e98-2e50d8e9fe3c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c68e2789-9015-4d81-8746-dad0fa211d2b	DELETE	2026-05-21 05:30:48.593
342d8797-6a51-482e-83a9-17c6d72db0e0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:30:53.624
de087368-0c35-4ec5-beb8-008f2fbaac84	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/91876ed4-c1b8-47df-9396-45f18954a753	DELETE	2026-05-21 05:30:59.586
a2ac112e-820e-478b-845d-6e722eb32cab	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/ad592b5d-eb7d-4a81-bd31-59e8e08a92f5	DELETE	2026-05-21 05:31:16.659
2a4cdd0c-009e-4d04-825e-9f4996d218cf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:31:23.619
578a192c-ea73-402a-b876-2aa1fe3356d1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 05:31:45.402
cc3dfddc-06bb-46d8-8af4-3e8b71bae6d3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 05:31:46.469
8e2c4bc1-4753-4c0e-ac23-613ffb7c13e3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 05:31:46.541
af9e681a-d222-4d4d-8fcd-0fccd12578d4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 05:31:46.437
fd9e61b4-d9dd-4a71-9d45-289f7574aa5f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 05:31:46.45
cb970666-37d9-4884-9d99-e8a9ed0e008a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 05:31:46.458
cf5b1351-dd7c-4288-9753-dc94bb02a0e9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 05:31:46.523
a6ac1710-377b-4d03-9e03-644cba511204	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 05:31:46.528
0acb98b3-694b-4c3e-9d93-4838e53eb58f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 05:31:46.562
5d36400a-d77e-42b3-8619-7252f2a764f0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 05:31:46.585
ad8590f5-e897-42f8-a500-11ab24ebb0a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 05:31:46.582
535ebe98-933b-4257-a054-ab79eb786262	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:31:53.628
b6674e86-f1f3-49e9-b78e-bdc485ce41f7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6112611b-52ff-4f98-ab3b-7b1c5fbc6530	DELETE	2026-05-21 05:31:56.149
ab2b4f6f-b2a5-4d67-a695-e53067fd02a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:32:24.353
fcbb9cee-3f37-4ea7-b3fa-58b80d191a44	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:32:54.352
56fc63bc-5977-44ad-bcd9-8963532cb5a0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:34:09.356
8f6cf4d3-3952-485c-a28e-258696b0acfd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:35:09.355
e693ffb6-3ecf-49e1-9735-f489260ef4af	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:36:09.349
b45e3aa4-4ab4-4c0c-a3ac-7b7f91489596	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:37:09.426
05581342-b0ea-4956-bce6-8a41a3ef4263	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:38:09.357
4007b561-dd26-4197-966a-3234e889b977	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:39:09.342
14e19492-ffec-4f37-92ed-5ee68310f0f6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:40:09.357
977ae6f4-2764-4012-adbd-90d5e25727c9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:41:09.349
4e1c4b9c-f056-409f-970c-b55211c38dec	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:42:09.367
616f41ba-b96a-4ba6-b225-c2696dd11029	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:43:09.447
eff46874-4caa-490e-8b1a-05360f259cf3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:44:09.347
6854b5f5-7218-43d0-a76e-7bf84fd857a5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:45:09.345
b85a5ca4-1969-46cc-9cd6-d15d28a5b600	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:46:09.344
1dc378bf-b125-4c59-ae79-ea9b468d05bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:47:09.367
eaaca973-d765-4f03-b595-184b90327ae4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:48:09.35
96e1935d-16b5-4426-83a8-9090c25f73e9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:49:09.423
2a735ef8-5644-42a9-9234-fc9a6fd2a2d4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:50:09.432
1f1701ed-4ba1-42df-8e16-7454c1ae3c81	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:51:09.364
c8fff223-fa39-47bb-bdf4-a046949e3c76	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:52:09.355
d60589bd-e555-4d09-9e92-3d60dc7322f3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:53:09.361
71f74835-8f51-4f68-adcb-fa2a0d99f361	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:54:09.352
08970e18-95a0-48f5-a8e9-9d18a95f35c6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:55:09.456
b148419a-14a0-41ec-a038-a88113017259	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:56:09.367
15c74e84-b7ec-48f3-810b-2148a88c1f6f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:57:09.353
54bc30db-e221-4204-b6d2-d6608f4e9568	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:58:09.401
517e5699-d7fc-4828-abbc-a74b6780f1b0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 05:59:09.359
4e463cc0-6f40-4fdb-b3da-77773dd8555d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:00:09.352
c8105753-0e88-438d-995c-9995b7a2ae2d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:01:09.443
3975ffb2-dd3c-42ef-9851-4afa07074db1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:02:09.36
4dfd8f1a-3ddd-45bc-9600-33e18972e5c3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:03:09.366
202e71a6-e592-4967-91ec-a7f11a6c53c7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:04:09.349
49720f3f-a691-4e3b-9c78-c29bc8d32782	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:05:09.353
8b1accd6-0762-45e4-a6e7-1fede09851f0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:06:09.359
e6910e4f-4f2f-4ca3-93db-f7b3d0bf6ba5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:07:09.469
50bed649-f277-4eb3-abf6-2e3f996a938b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:08:09.367
40d8c26f-58f0-49d1-962d-915dfc3c610b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:09:09.354
447dae21-e1e1-4f2d-bb8e-ef906a7901cf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:10:09.347
fa99885e-5af9-419a-812e-a02b19d7efff	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:11:09.365
81dfe76e-4538-4b50-a7af-2b9b9ecb067e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:12:09.344
d1d2d24a-9c69-49b7-9b93-d92257c73834	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:13:09.469
8e361ad6-2ce1-4f27-a102-0876f33db5ed	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:14:09.363
db830e23-6919-4222-b5b0-4718dd7e349e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:15:09.355
c20d32c4-4ca3-4927-952e-b4bb06295d2b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:16:09.354
3b152a2c-8211-4130-b2ee-096ac981d01f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:17:09.35
c70c5cd5-72b5-4cb3-b4e3-9aa87f615c20	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:18:09.356
f91b4d32-de5b-4617-a3e8-81a6e54660f8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:19:09.425
80be5577-aa62-41b7-ac24-a8e46245f821	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:20:09.354
d3c19b0e-bc98-4497-b431-2598cf1b5d8b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:21:09.362
f5e68692-4901-4714-90e0-c042dfdc56f4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:22:09.354
655591c1-1a80-4285-9a08-06827e6686ff	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:23:09.354
a819abd1-c367-4ab9-97bd-1f3144c07ac0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:24:09.37
47e8abb9-dc0c-43a2-90d5-dbf382729b46	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:25:09.439
8e91d00d-82a1-4701-a36d-9af29bed98c3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:26:09.36
ffd4bf40-96e3-47f7-91ac-4db5f6f4e307	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:27:09.358
98c949fc-3309-4019-a4e6-8e3151f84682	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:28:09.396
d9108172-6f67-40a3-9353-2930e62c281b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:29:09.35
d08ce7ea-ddb3-4d99-bda4-747f87c34372	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:30:09.351
238d32ff-8114-45f1-918d-3eac1f0d0214	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 06:31:09.432
0bb845a7-d75a-4363-9eff-bb55f4538e23	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:54:29.138
c2789916-482c-4343-acd1-8f583e28854b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 07:54:33.812
38ae3f84-466a-4e92-ada3-f7a49a7a5a90	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 07:54:33.83
55706dc9-61f9-41ae-8f4b-77e5c4d51e19	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 07:54:33.86
69b1d022-72b6-4811-845a-1b4ed7cf7aff	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 07:54:33.869
0fb0ce3d-4eed-4d3f-9af3-f014f86751d7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 07:54:33.875
de45d1e7-9208-492d-b777-a21911428729	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 07:54:33.886
e867abe2-d6f7-40c9-b1da-e0378e884a3d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 07:54:33.884
658e2aee-afde-49c0-be99-8d50f3ebd910	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 07:54:33.894
63fdfc7b-8b2d-4aa3-b2fb-9877952e9aea	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 07:54:33.901
479b7401-99f0-4fe9-ac55-17ccc6859316	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 07:54:33.908
fddb9a95-c6ce-4d44-8265-16bcc477dadb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:54:53.632
3c7df52b-23b4-4d34-a69c-52cf5c6f7af5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 07:54:58.754
eaf7233e-ba75-42b3-b21d-2f53465fbf93	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 07:54:58.725
9561feed-62b4-442c-bc85-742f5d9c0cea	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 07:54:58.741
514e7daf-0ea6-4f45-b4e2-de8c711a91f8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 07:54:58.728
2db5bc63-57e9-4909-ab8a-239755f0d60e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/revenue-trend?type=day	GET	2026-05-21 07:54:58.767
1afc21c2-bb33-402f-be76-85bf766f6fb0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 07:54:58.75
fc986c13-f20a-4f5b-82b8-b796ad84aa08	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/overview	GET	2026-05-21 07:54:58.763
41403dce-3901-48cc-9798-fb911d2a697b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?limit=5	GET	2026-05-21 07:54:58.781
4a0041b3-d147-49e1-95b8-85f0b3e53c10	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/category	GET	2026-05-21 07:54:58.787
029d68ac-7cea-4a89-b111-ddd7880aae13	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/stats/top-products?limit=5	GET	2026-05-21 07:54:58.783
d4658411-1c4c-40cf-a837-da55d2eb7cbe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/analyze-revenue	POST	2026-05-21 07:55:17.309
f2053339-a8ee-4e45-ab51-25cf199d15e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:55:23.635
9871b785-19a4-4207-8c33-084a8a5472bb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:55:53.648
a711733a-c4d1-4d13-bc21-c3e6cf49e046	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 07:55:54.135
d3b24538-5878-409a-a07d-c5c697d383e6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 07:55:54.157
b42a7bdd-4a9e-4173-877d-136d303b9ea0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:56:24.353
f1df4c49-8f7a-439d-8b79-9e5af6e4f98b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:56:54.349
18d0dd52-dd2f-4940-8eb9-4783e2e5a37d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/images/34f3f72a-bbfd-415a-943a-011e270619dc	DELETE	2026-05-21 07:57:16.544
40900aca-449d-4886-9d97-f1d1d808e731	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/images/f0dfef3d-006b-4d89-bc93-39a132dd05d6	DELETE	2026-05-21 07:57:24.916
c6074b3f-b871-4cf3-bc55-c8d37eb8e6f6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:57:24.926
bf34ddeb-7541-40f5-a57c-39bfc063714d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:57:54.348
ec92ae59-4d3b-4afe-ad9e-f46a0093dc68	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:58:23.837
48c2884d-542c-4b0f-8343-410a48dd41bb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff	PUT	2026-05-21 07:58:48.086
79f085c7-b08d-4d8c-af07-fad91f44d4f6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff/upload	POST	2026-05-21 07:58:50.75
35a11923-7228-4930-9b05-2a9d79467565	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:58:53.629
a1bf6545-d3fd-4f5c-9e2d-afce2eb3a7ca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 07:59:05.158
1931d7ca-1e25-4cd2-9ab6-ee79c1abf5e6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 07:59:05.18
d2b13287-d035-415f-8159-b72bb104f8e1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders/68383114-49ff-46cb-9049-511c7b298f5b	GET	2026-05-21 07:59:07.695
d1e62db6-51c8-491d-9594-ac9877e92580	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:59:24.356
485c4bdd-d087-4cb0-ae6e-371fa74bf568	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 07:59:54.406
a6c7a822-1d94-4c7a-a30a-85f3e6459a50	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:00:45.941
37a9b264-e83f-42f9-818c-2a7a687c13b0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:00:53.636
81fda4cc-595c-4a4c-9638-5d08de84dcd8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:01:23.63
f82f073d-4dfe-42a4-95d1-0cda895373b5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:01:54.352
5921b01b-cc22-49ff-83be-f2b97b1ea3dd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:02:24.355
0fea53c3-a4e7-4fa1-b206-fc965671e634	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:02:53.63
6e7c2bd8-0df6-4743-85b5-862b8186276d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe	PUT	2026-05-21 08:02:57.915
7245a409-2836-4614-a527-0cda6f7fcfb9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/images/9267ab75-acef-46e0-a8e3-db6fc17746ad	DELETE	2026-05-21 08:03:10.529
f038ab08-ac1a-4fab-847f-ba9b5869b6f6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/images/ba7a8cf6-800a-4503-866a-307fc9fa3729	DELETE	2026-05-21 08:03:16.257
d74ba9f3-c619-4638-bc86-d74dfac85176	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:03:23.625
c92c68a4-f530-40b7-8224-a76d27833d9b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:03:53.625
0bbfb820-da17-42aa-a4be-63b096efcf8f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe	PUT	2026-05-21 08:04:15.382
bda1f832-0967-4771-955a-9141a9768f3a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:04:23.623
2ef16386-a2ee-4356-b744-93fa8b25b78a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe	PUT	2026-05-21 08:04:30.726
29fd0c0b-6a68-4608-bd36-847d61e0725b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:04:54.35
f701e01c-e36d-44d5-96bd-dd1ed3be522a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:05:23.621
dd0d42fa-255d-40a5-8dd2-383eb884dcaa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:05:53.686
1fd68aca-220a-4dc5-92e3-f2fa5178a8cc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:06:24.355
d389f9ac-8b6f-4162-9c69-f98d5fb5146b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:06:54.353
5d633f96-9ce6-4c92-aa87-05ce2868eec2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:08:09.343
ab171b43-2880-4fee-84b1-774b3095700f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:09:09.365
cdc001d1-5774-488c-a725-2555e7c6faed	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:10:09.391
9185ef82-ffc4-45d3-a2ad-dff46e5190bc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:11:09.402
43cf2402-0c89-4877-abe2-4024f51c4bfa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:12:09.368
7cbd9475-8357-4d4a-8e47-028c19c647b2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:13:09.362
c8961c7f-ef58-448c-aa81-69888bc0f263	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:14:05.786
b582fc0c-2c60-4ecd-a389-01622f691bd3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe	PUT	2026-05-21 08:14:07.14
81c535ae-60d6-460e-a433-bf435c32d506	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:14:24.357
7a4992e1-440b-4ea9-9b8a-807d55d76ce2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:14:54.337
2a353803-1a17-40f1-919a-e25f49abb6c6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff	PUT	2026-05-21 08:15:19.46
09025aab-f354-4851-9c68-6b264e0675a5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff/upload	POST	2026-05-21 08:15:21.788
4b87cc93-2641-4d7b-8968-b4bfb888ec81	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:15:23.62
82f09af9-be77-4b0f-b314-beddc9fcd50a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe	PUT	2026-05-21 08:15:33.199
9307dce3-ee5b-424a-ba0f-c9cefc06f1ba	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe/upload	POST	2026-05-21 08:15:36.799
9a04909b-8fbd-4e59-a180-9cf23fbb7505	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:15:53.624
2ff29b43-2b0d-45f0-bdde-f1912e09eeba	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:16:23.63
9d3b46ff-5235-4064-b7b3-a5ea33a65589	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:16:53.629
d3c38cc0-4c9b-4daa-a25a-b2cddb9b51f0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:17:23.632
312d241d-afbe-4027-bda7-63a944d127b5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:17:53.637
4f2450cc-1a75-4e3c-8264-3ab5ab8fdf98	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6a1989ce-70c3-475e-94c3-c276d7853dc3	PUT	2026-05-21 08:18:00.769
7fcc0b82-39ea-4151-a8fe-d556b521f98f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6a1989ce-70c3-475e-94c3-c276d7853dc3/upload	POST	2026-05-21 08:18:03.128
597bb647-11f1-4d31-9e32-e56c946035f1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:18:23.643
01916c9a-3e0b-47b4-9446-943ff57f2cc4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:18:53.627
23d821b8-fc4f-43bc-b8c0-c3cf58277ea9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:19:23.63
01d688a6-f920-4308-b9c1-2d6c885d2c80	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/2eca6f19-46e9-4d2c-9fe5-af77803038d9	PUT	2026-05-21 08:19:45.6
1c544981-5b6c-426a-8dff-20d72008bd39	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/2eca6f19-46e9-4d2c-9fe5-af77803038d9/upload	POST	2026-05-21 08:19:47.747
c221fd27-482b-486a-bc85-736f00d54236	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:19:54.395
3dd8fa83-72db-4606-8a32-f0c7124fcddd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:20:23.635
bca77627-3435-404e-b0de-c52a37d6b14a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:20:53.629
d9aa723f-7d7f-45a0-9bca-8cecc222b506	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9b080ce0-dff0-4166-adfa-34e9eed7339a	PUT	2026-05-21 08:21:06.481
a177779f-f909-453f-969c-8f9002ca082d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9b080ce0-dff0-4166-adfa-34e9eed7339a/upload	POST	2026-05-21 08:21:11.537
edc5f2d9-0780-460f-8e5d-b019cfe46eea	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:21:23.629
d129f6e3-cff5-45e1-b7c9-04d07f51dff5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:21:53.632
b3a8935b-aa15-4316-8250-21720053a0d6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:22:24.359
ad061352-0625-47cc-9297-6804dc7df7fd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:22:54.349
f0fea7ad-6a1a-4ace-97b7-50a06c664964	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e84a6278-a906-4b6d-8d7d-05a919923b37	PUT	2026-05-21 08:23:18.103
aa48887e-a496-4563-8720-f2df017cc5e9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e84a6278-a906-4b6d-8d7d-05a919923b37/upload	POST	2026-05-21 08:23:23.209
fc5583d6-140b-4258-a3cf-55f814f52416	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:23:23.615
4ef514e6-8221-4cee-9647-8724fc2c9d2d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:23:53.633
fb158128-67c2-456b-97c6-28490b6a1b61	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:24:23.632
68fdec9c-9706-426f-96c2-cfad1c3746ab	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:24:53.734
d1b9e76c-91db-4ee8-8650-9e1c01a6f1b8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:25:23.665
a52c3b0d-4ced-4a31-9fef-961114554c34	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:25:53.629
070486ac-3944-4b4b-a797-1408f42e7c8b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e84a6278-a906-4b6d-8d7d-05a919923b37	PUT	2026-05-21 08:26:15.27
38a6339d-8157-44fa-b807-4ad7017745cc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e84a6278-a906-4b6d-8d7d-05a919923b37/upload	POST	2026-05-21 08:26:20.334
de35558a-48ac-4fce-b2e1-5396d878f629	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:26:23.625
e9effb5a-efca-424c-a9d3-8cbb191ab353	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:26:54.347
83baf17b-f009-4c1f-b281-4a6f9b92303a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:27:24.353
22ed4494-111b-4cf7-b164-3479312d887d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:27:54.346
7090ef56-d5e8-4797-8f9a-6c689044e16f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:29:09.347
fe3c30a5-edbb-4b0b-9043-87b3d5c9bc0f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:30:09.403
4e455f6a-00f9-409d-8178-eb9b49ad1e7e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:31:09.343
864dfbe5-e957-474d-ac53-993b739b7c28	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:32:09.349
99f2c181-ccd5-4b58-9e0e-635c43ac1771	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:33:09.356
1f6c528c-16bf-45d8-9afe-fe7f8aa324ce	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:34:09.356
f5254a51-2b5b-45a3-84f5-8c8176e51eb7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:35:09.344
930572cf-a7c7-4f9b-8d2b-33a88fb4f5eb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:36:09.429
3663d484-a18f-4da7-b86e-5695afd88355	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:37:09.353
bf5b231e-b4f3-4bcf-a6b3-529d03bd6be4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:38:09.351
5aac5d88-b498-4fdc-b939-fd4f9cdf94e6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:39:09.353
1c38054d-529c-4a36-87c9-fa6c7d3cbf45	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:40:09.35
ef2a36ba-b634-4bdf-a1fd-65b3bfd82e41	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:41:09.389
58f8dea6-9b95-4970-80cd-6542948cace1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:41:31.729
db642c14-5d7c-4223-b4d4-0537dff3451c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:41:53.633
8fa99f5f-5063-4a35-a54f-02a9b4d76e8f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:42:24.368
01720bff-da7a-44ed-8b3b-ecba1cdc5109	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:42:53.628
b51913d5-dddc-4d2f-adcf-e7e763de9624	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0edd5422-68eb-4e94-9030-b9a67afea7dd	PUT	2026-05-21 08:43:20.654
2cdd4860-3a8d-478c-8aa5-3aaf01efad9e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:43:23.637
a5bfdd88-9fc4-457a-b1ba-d0612c2ed4f8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0edd5422-68eb-4e94-9030-b9a67afea7dd/upload	POST	2026-05-21 08:43:25.755
32fc2c16-cb57-43f6-87c0-70133b051c0e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:43:54.364
035e3731-59e7-4890-bf35-ed266c7d7105	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:44:24.358
c3d86918-318e-46a8-8b01-e9d4b666c078	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:44:58.972
db14cf9d-742b-451d-8e63-3a336172fb9b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 08:45:02.634
d443a145-d8b0-4d7b-9bf3-30010b322206	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/admin/orders?status=&page=1&limit=8	GET	2026-05-21 08:45:02.649
834b7447-bef9-42e2-a61c-a8f17acf1685	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:45:24.363
76df29b6-748b-40e7-885f-28f206fe5efa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:45:53.638
0ff8d011-8510-4061-89cd-6045700d285f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:46:04.195
29f9b384-14f4-4b8a-9617-83948f605b97	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/49189589-4122-41b9-9f55-2cd9954d0141/upload	POST	2026-05-21 08:46:06.92
fb1a6261-90f9-4d90-a1e7-6e79f1bddd9f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:46:24.34
69dd41b5-8d18-486c-81ac-5be768ec594e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:46:54.397
95044a36-e767-48e7-a49c-dd400be89dbd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:47:24.355
bce22129-b73f-41ee-946c-3d80469943ce	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:47:39.327
eb46dbe3-642a-4b26-af51-9299d53f465d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/3430a0e3-d0d7-4f21-94c2-f4e793da4d3b/upload	POST	2026-05-21 08:47:44.438
853dde86-2845-4986-af41-9089700e6a35	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:47:53.64
438d89c0-7f49-47c0-98b1-8d7da668ff35	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 400	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:48:09.372
c8fc3af1-f094-4f10-94cf-a5de691602e6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:48:23.633
3155ecb5-b465-4abc-bdb2-2281d9b96175	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 400	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:48:23.976
f68871af-33d7-416f-98c6-7b631c594cc4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:48:53.629
13fbd765-879e-4de3-9376-02e8962bcc89	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0edd5422-68eb-4e94-9030-b9a67afea7dd	PUT	2026-05-21 08:49:22.079
677edf34-34cb-45a1-a3fd-73360b61242b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:49:23.634
b136ecb4-441b-491b-8cc0-14344180b5e5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0edd5422-68eb-4e94-9030-b9a67afea7dd/upload	POST	2026-05-21 08:49:24.932
2b0b2be9-0e43-43e4-8e16-ca23aca3ce31	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:51:24.348
b4c52d44-9977-41f0-8db0-a45b5c9bd1df	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:51:54.344
5a6ad5e7-d593-4bb0-a01f-0c225866730b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:49:53.621
07a7022b-0293-4efa-9626-ffc1be970028	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:50:24.453
afdebc2d-86f4-4c57-a261-81b5b1b25592	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:50:54.355
1c37ecd6-6609-4db5-a372-3254f465a2f9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/3430a0e3-d0d7-4f21-94c2-f4e793da4d3b	PUT	2026-05-21 08:51:11.616
4728e40d-0cd9-45c5-b258-486fd1126991	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/3430a0e3-d0d7-4f21-94c2-f4e793da4d3b/upload	POST	2026-05-21 08:51:15.092
a9a07a61-c48b-4713-acf3-e43f9b1ebd5a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:52:22.189
8cd9a223-625c-465a-9288-5eb4b8d82fa7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:52:23.632
faaadb75-aeed-4876-aa2e-e1f25505614d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/eb7fbe43-7296-449a-aa50-8c62f5b37f40/upload	POST	2026-05-21 08:52:24.441
e30fd5da-7e22-49ad-98a5-990af54c3d2d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:52:54.359
a1155daf-2ae6-45cd-8f2e-b81650a86bf1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:53:21.263
84e46a41-580e-448a-8037-f7009b2d0497	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:53:23.634
6cb671b1-1702-4d57-8616-2823f0ca4ca3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/a4f7fd8a-a14b-4030-8136-457956dcf3d2/upload	POST	2026-05-21 08:53:24.017
978eebbc-6419-4fab-8289-a7592e525ae0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:53:53.634
a4306867-f312-43a2-93db-7cb1d1771669	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:54:08.385
8884c616-b4b8-437d-8e3d-e11cf8392578	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c8907458-7814-46b1-b9e3-4d606b831b5c/upload	POST	2026-05-21 08:54:11.01
a647c3f7-5035-4ae0-b614-402c664ac5bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:54:24.352
e8c32c43-4eb8-47e2-b3aa-76a697f9a40e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:54:49.425
db3ecca3-4015-4aeb-b6d8-26725f8b953c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f994ac8a-37e1-4273-81fb-74e4e7958dc2/upload	POST	2026-05-21 08:54:51.649
32654f41-6224-405d-a18f-4057012579f1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:54:53.623
fb94cf7a-015c-45a9-b08a-60131dbacbbe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:55:24.347
31ab2585-ada8-44d5-8158-85cd054fe316	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:55:54.34
75b149d8-e7aa-4b7e-97cf-b1cbbf1ed54f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:56:13.221
7a3bea73-9509-4a8e-8d2c-5c5f7d3a43f1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/569d040a-b54c-4594-a865-0b5aa214a8e2/upload	POST	2026-05-21 08:56:15.646
c5714729-ef2f-456d-af93-99a2f763f486	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:56:24.35
99e1c339-b98f-45cd-a427-91d8950f4e6b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:56:54.346
10e36b4d-0fe5-4577-be38-9dd6b2dc2e31	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:57:23.632
bba7f74b-ba60-43da-9dff-15773f5e7f42	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:57:27.266
6f954baf-f555-420f-8e0c-616cfe5fedf2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/d19ec357-922f-4bbe-8d68-e82bdd102434/upload	POST	2026-05-21 08:57:29.329
3e29fe7a-ae49-4d60-89e6-f3fb5947142b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:57:54.36
efb2b599-61ca-4e76-8003-665787d17476	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:58:24.358
8277da5f-b787-4240-8eea-9bd3b22f2896	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 08:58:45.051
086f23b2-0df8-4052-be02-baa36bbee9fb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/4fbf0a8e-3761-4e0c-8518-95e14d45f855/upload	POST	2026-05-21 08:58:48.08
81cc2f9f-7972-4c4b-964f-d02e6f6805b2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:58:53.625
e46bcc31-a141-45bc-b38a-0c3e26f21444	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:59:24.358
0e657448-f332-43ab-ad70-8d4f5fa1e7f9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 08:59:53.625
f8e81249-62e4-449a-ac9f-7524248fd61a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:00:23.631
8de413c6-5691-44cd-b96c-780d37f9b9bd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:00:26.797
1e2a30ee-7415-419e-a098-b8ca8afa6ca3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c5be2391-81bc-4112-96c7-9d6f001fa416/upload	POST	2026-05-21 09:00:29.601
9b56db86-bfdd-4354-b9fd-120ec133b90b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:00:54.348
bacd9d6a-d005-4f2f-8d99-af64ed3f0cb8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:01:24.348
3bd30ef1-eed4-4ae1-abc4-b0c2b924b9af	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:01:53.621
6f0b5957-521e-419a-8178-db85e8cffea7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:02:03.537
24091dce-2ad1-4e89-820d-aacd09c85b19	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/af28dfc2-91ef-4715-93a6-6e5e42b4b15d/upload	POST	2026-05-21 09:02:05.905
1e93772d-a144-4f01-9a3a-0819441373d3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:02:24.346
5cf80b23-9df9-4264-bbbb-6c5672508e1b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:02:46.915
5018f95e-f0bb-4327-967a-0011ba18c3a1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/ccd909a5-fa59-4253-ae4e-1db9b104e704/upload	POST	2026-05-21 09:02:49.489
e4f5d526-6a6d-4398-aad0-af9cfeec7e12	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:02:54.376
ba4018e1-5d92-4e82-bc7c-b2e7820358ff	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:03:23.633
b0d8de48-018f-48c8-93b3-03936a59f275	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:03:50.328
c6f4b42d-85d6-4bd1-b72e-b9375e4229d3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/db10b02c-58f1-402e-bcd4-d7f247ed54d5/upload	POST	2026-05-21 09:03:53.234
00c8f7d8-1cc5-4d9f-bf79-9fb3b85f6c2d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:03:53.629
84309b27-7b50-4c18-aa28-af70ff9099af	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:04:23.636
a5117ad1-5ca5-4e7b-9a81-c248e1b4c0e9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:04:53.637
4b46293b-1eb2-493b-835e-fe4cec37d302	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:05:24.352
39bfb79f-6bfc-493c-9a67-509362c53f42	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:05:43.645
88af7a81-1420-4ead-9f3e-b70017dc00f9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/d708039f-b2a9-4868-b262-1793fb19bb25/upload	POST	2026-05-21 09:05:46.628
9daf28fb-643a-49b7-b577-a07bf17a0cb7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:05:53.622
3fd55a90-8132-40b9-a014-2b69b9b77306	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:06:24.349
b1518b58-bd21-4e8d-9b56-021cf8ef92bf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:06:53.625
d58b1a51-808d-4bf4-9500-451b500e0724	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:07:23.633
b02724ee-cce4-478c-bd9b-55d5d3872181	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:07:32.135
793fc602-fa73-4ad9-9f1c-d78a2157ac1a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/b0fd4c30-13c4-41ee-8f5f-7a570bea23e6/upload	POST	2026-05-21 09:07:34.381
2f1e6f22-fda5-48c6-9fa8-d4019aa19edc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:07:53.634
1c49ff56-b6d7-4529-93e2-71b3cd311d54	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:08:24.359
c72ef794-d317-4a3b-8d18-4720a3151b18	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:08:53.646
0b7658bf-a80f-4428-9159-b0fd851910ce	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:09:00.811
738b9d37-d526-4d59-b836-717a5cc61042	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/85edf011-cdf4-4c3d-a079-e16cea300cca/upload	POST	2026-05-21 09:09:05.89
0bd8386b-f92f-427f-8ffe-95f4a2c9ea19	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:09:23.63
e0cad234-01bb-4426-bc7a-7a635b65baef	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:09:44.652
e418f1cf-fbd4-4314-b1b5-c3699c37854e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/85edf011-cdf4-4c3d-a079-e16cea300cca	PUT	2026-05-21 09:09:56.108
8a2dd0e2-bc24-478e-90eb-27766f5ff657	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/85edf011-cdf4-4c3d-a079-e16cea300cca/upload	POST	2026-05-21 09:09:58.631
4a26754f-ec4f-438f-b840-5c3b97f7e411	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:10:15.363
b134138b-6d33-45a2-921e-37eba8382fa7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:10:45.362
ddd9062e-a294-488c-b3a9-8a79d7010633	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:11:14.635
a7b6e40f-80f7-477e-b756-3a6950400524	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:11:26.347
89b037c4-5c84-4d71-aa8f-8513d301e323	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/24736bc5-5851-46ce-941e-5c69cbb20914/upload	POST	2026-05-21 09:11:31.561
b5a4fdd1-40ba-4ce3-a72f-7a7870cfbc16	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:11:44.595
54025fc6-a612-45bb-b2d4-3858ec890c57	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:11:51.162
889eebfb-7245-4bb6-9e8f-37e96fd3b297	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/1949fb1b-6b79-4c63-a319-4b83faa87f2d/upload	POST	2026-05-21 09:11:54.483
4605ae52-83c5-4f1f-90b7-a6541a4ebd55	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:12:14.597
f621577f-1d48-41e2-8ae8-039e2460ab00	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:12:45.371
8bde7d7e-5ec3-4e2a-983c-5f589fe9e3aa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:13:14.596
24e69164-7618-44e1-809a-5b139686a537	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:13:45.367
b0be987b-8b6a-41f0-bc43-539f6ffff8ef	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:14:14.6
8a633731-81f3-4bb6-83f0-088858de3a1e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:14:24.355
58b899c6-bd61-4a61-8637-2574abadb4cf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/cf10d9f9-baaf-4f87-8dd6-135fcf9fb129/upload	POST	2026-05-21 09:14:26.103
3fdeb7c3-5860-4abe-b4c2-95b6c01e15fe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:14:45.408
b2627611-eb24-49ab-96ee-dea32ba8a19f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:15:15.346
60afa6dd-4d88-464c-8e9e-c419469bdf71	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:15:38.726
b827baeb-39a0-40cf-967b-ae5513f3c91d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/933cd7d8-45bc-41fd-9811-705e75819a33/upload	POST	2026-05-21 09:15:41.296
6eb54806-2d9f-4f3b-a804-c080520aa399	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:15:44.61
38c7d672-6cb4-412f-b2e2-1f943c74edb5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:16:15.353
bdf43c70-cac5-46c0-aa31-261a141d7a21	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:16:44.588
574435ec-48fe-4437-8a9d-3cf962349476	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:16:56.354
b1b93451-4591-44da-9720-45465db21e31	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/da23d738-724a-47d6-8721-c8b93653eb88/upload	POST	2026-05-21 09:16:59.209
61951b07-98a9-4e3e-bbc3-0b0c87f2f0d4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:17:15.343
eaa4d0fd-1fd4-4efd-9c8a-04ed3024bcc1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:17:45.347
82c31b2f-cd16-456c-9a8d-2d814180f023	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:18:14.6
6bf28d6c-8346-4d5e-9e8d-8edb5190725e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:18:18.644
41225737-5d16-4059-8c60-d01df34f8e5f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/680a8690-635c-4b55-8379-77d6b41f001a/upload	POST	2026-05-21 09:18:23.081
92f7535d-a40c-467c-a022-ae08d3acb321	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:18:45.348
c484f81f-0c4f-493c-a7ea-48e7eb1b0d04	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:19:15.35
3dcabfb5-f088-4ffc-9115-ee8c67978b23	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:19:44.593
e5a833bf-7bb7-441a-94d4-8b7416f01db0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:19:44.795
4af1267f-da61-40ae-a526-df0182f81b85	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 500	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e224a495-cc12-4069-a901-236170864bed/upload	POST	2026-05-21 09:19:49.908
fba89b36-3c9e-45af-a4f4-2bbaaeaf5500	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 400	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:20:13.593
9f3c9d0f-9c20-4dbd-a4a6-3dd7e30e9910	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:20:14.585
d56abe92-b3f6-493e-8809-0fbc63ae3ed2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e224a495-cc12-4069-a901-236170864bed	PUT	2026-05-21 09:20:30.399
4e25d1bf-ed02-48f7-94b9-9a46c618728b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e224a495-cc12-4069-a901-236170864bed/upload	POST	2026-05-21 09:20:37.274
c64094f2-ad52-444c-bd1d-3201208dfe7a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:20:45.349
79342e5a-0da2-4415-8942-58cae94b6692	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:21:15.357
b11df162-fce6-49d0-9511-a15669176915	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:21:41.076
a5db0b25-fd7c-4eaf-8e84-e0057c109b73	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/deb5397a-890f-4699-a7c6-abefc52b6e23/upload	POST	2026-05-21 09:21:43.458
3793d788-b457-4ff1-a316-1e00fe2d9696	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:21:44.607
d2f5da2f-a78a-4f50-bf56-81aa44310e04	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:22:15.345
1bd0a354-f205-4086-87dc-ffbabc3b6de2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:22:45.354
6d101f61-0331-48bd-a3cf-1bd6b1c4e6a4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:23:14.596
99ece308-e4d7-4b7c-b9e9-9d36d2dda6e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:23:29.029
bc7f9af1-20c9-4d4b-ab62-f0a672b6686b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/d4bfe112-a4db-4ccd-8280-ba952215e317/upload	POST	2026-05-21 09:23:30.923
73fd37cc-a2e8-47c3-8c4a-3ffd97d51c06	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:23:44.587
6e36f2d3-7a7a-4df7-84aa-b00afce97b8a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:24:14.58
88de3108-879d-47c7-9f0d-74df2298c018	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:24:44.602
d03de2a7-2610-4339-b813-010a44c1d0bc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:25:14.608
74e10247-af6a-4fd2-a63d-b241606dd15d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:25:44.581
79aaa7c3-e996-49ab-9bb0-2d6b65297c5d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:26:14.614
c8b497f0-6c47-41e8-aed9-6a40f702631a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:26:44.665
56895154-9f7b-4523-92bc-87c5d452928e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:27:14.586
729a6005-5586-45d3-a537-492c9378787f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:27:44.599
9b0f4e03-db1b-4cfa-8587-25fd49612537	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:28:14.604
5375e492-ea7f-4a3b-bea9-fcd8406dba55	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:28:44.593
261cee0b-c0ad-47be-912f-c5cd1e98757f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:29:14.587
8123ee52-6233-41b9-ac19-8fee58b86986	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:29:44.6
dc70f428-a2cb-4399-a112-1cbb46f00676	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:30:14.587
3dd2880b-96f1-4954-b2c1-0422ae871ca1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:30:44.598
b4b087c7-2715-41bb-ae19-4bc6d688a853	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:31:14.585
488154ce-24e4-4b33-a1ef-8b85b1cb6c14	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:31:44.596
b5d2a524-4e56-404a-91ec-6c0fceb8e626	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:32:14.661
d9aa14d3-6979-456d-988b-791683a04e3c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:32:44.598
50f4629f-5243-4963-be59-1414de586c64	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:33:14.591
6d8d8cbf-43a6-41ed-b077-777652917f06	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:33:44.597
5c3a196d-64c7-4739-83c7-819f802958cc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:34:14.593
16c8a8e3-5aff-4d2d-a987-98ec99885bac	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:34:44.595
f7600fb3-2439-4b1b-971d-c8c4f5f5335c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:35:14.581
4c72bd8f-5e87-4d27-a604-2f319bd219c5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:35:44.584
b1c3f083-126f-4460-a764-d4f2ba30f1e6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:36:15.349
0f266817-6efb-4223-bbcc-5c248163827b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:36:45.348
b3f89244-c0b9-4b4b-bb6f-bf0edb2a8497	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:38:09.435
c9557fc1-8cce-4413-b774-b89fd6442d65	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:39:09.363
6f035e1c-fe9d-4fe7-a8bd-8dcb6c7e9be6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:40:09.352
f3bbee16-d165-4dd3-9511-99441445d056	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:40:14.581
f10dea80-fb36-4ae6-b8c6-e33ab50547c5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:40:45.358
edbd8435-887e-4697-a0fb-5125d2519ce4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:41:14.608
273a81fc-a7d4-42b9-ad48-06e558e11b1e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:41:44.586
251d47d2-2e8c-418d-9e7e-2887e3ce630d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:42:14.254
f39c0213-c622-4abd-afea-bdc1573e1594	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:42:14.594
19b65d10-0aa9-43ae-840d-99bcbde3354f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/1e1b58b3-781c-4d3a-b4ff-40002d5fad6d/upload	POST	2026-05-21 09:42:16.124
efb51441-0b2f-43ae-a4ac-a18ccc4ddf48	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:42:45.366
82824cad-dd9b-4b80-97a5-420d81481aac	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:43:14.603
f0306fbd-a57e-4cd0-8b3a-c10d21b6184e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:43:45.365
7cb13117-3b1b-4324-b689-5ffbda548644	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:44:14.582
ef809375-61db-4653-be7c-488757ded196	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:44:21.27
70340558-26ac-424f-b5fb-8f5d5e6b8d89	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/4fa704d7-8f58-4fee-819c-913f8583bf99/upload	POST	2026-05-21 09:44:24.286
7c4e4b37-7ffd-40f3-97ff-8a025830ce95	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:44:44.587
9367c263-3f47-42d8-97c0-f0332556698b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:45:14.611
d0fa2d5c-0366-4742-9fe1-85e0c6992c9b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:45:44.588
58743a39-2232-4938-935c-1b429aa43d55	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:46:14.595
e768b52f-c701-499c-ae61-4bafceb710e4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:46:44.61
5916d4d3-4dc8-41cd-bfad-9d09fed3dac9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 09:46:57.553
42467a81-b178-4f86-b97b-2fabd144a2fb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/600a9046-2e76-4070-bb44-3f8042af6c44/upload	POST	2026-05-21 09:47:00.202
f6ee88a8-310b-4ab8-b4f0-0960bc8b56e2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:47:14.591
b3c8021a-d604-4de8-8471-13d76b27dba4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:47:45.357
80b126f4-2e7e-4dd1-8374-65d91551377e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e84a6278-a906-4b6d-8d7d-05a919923b37	PUT	2026-05-21 09:48:09.337
727fb861-06b4-4375-a713-d55ee51a8e2d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e84a6278-a906-4b6d-8d7d-05a919923b37/upload	POST	2026-05-21 09:48:11.354
90e8f934-c19d-48b1-8f7e-a1cb356fa134	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:48:14.6
96b1ee2e-47cb-44cb-b52e-6e2ff0485d4f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:48:45.357
eaf9942d-f79e-4a23-8192-5348dbc5d5f1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:49:15.36
53f0eaf7-5eca-462a-a56b-8214fda807d1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:50:09.441
ce192cd7-c6d9-4661-a225-1226664efee7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:51:09.359
19877022-fa7d-45ec-a153-82855a6c4e4c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:52:09.362
629d4464-fbf9-4fcd-b79a-17435c8a2891	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:53:09.362
8580bcf9-2480-41b5-8a7f-256dd9f62220	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:54:09.356
73fe3923-e803-4463-8e5c-28364c889418	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:55:09.365
605f82b1-6685-4ff9-811a-883b26f790e8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:56:09.444
42e73881-d23b-46d8-97a1-12f3a5297cfb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:57:09.406
189bbbc0-ab3f-4ae0-a192-609942e11cf1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:58:09.357
6281f5cb-0383-4b9f-b0a5-c5a905117fde	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 09:59:09.366
36ae5c47-fcb5-4dd1-890e-aafbabb698b7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:00:09.368
3f4b52f7-4cc6-4b06-b959-717e05935e07	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:01:09.36
684b2163-4e46-4f7f-8199-2b0a691529a8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:02:09.407
4bb29122-7f49-4458-abd8-df449a1c8dde	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:03:09.379
8a35d8a7-9ab6-416f-a526-c7fca75e86ae	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:04:09.357
d8bc767c-9301-429a-b9ee-e7be93397cde	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:05:09.375
f8aa4a7f-2a41-46cd-a1cf-c88c9ece73a3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:06:09.349
845ad0e9-4280-4f7d-a758-943930c83e43	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:07:09.363
a52936d3-8853-4ed1-84f0-efccc17a800b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:08:09.439
e0f12598-34d8-4c5a-b8fa-2a2b8324d7c9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:09:09.355
31f040fb-3345-4b3a-9eda-614804c3c475	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:10:09.351
da60af2d-5150-4c9c-b562-89fe362665cf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:11:09.346
d96d380d-d652-4377-966f-8218df7e01ab	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:12:09.404
e11c79fa-abde-4192-9f31-432d1e7dccf0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:13:09.354
146b2533-7ea5-4acc-a09c-b698a3e1c399	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:14:09.457
143b8ae9-6621-45d6-9d57-0591eabe2bec	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:15:09.363
9b112b16-1bac-4ee1-ae4c-320e8063ec16	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:16:09.366
3622e815-53bc-498b-91c8-ca90412a3876	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:17:09.36
8bc474cd-60f0-47a9-80c9-db31cd9048df	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:18:09.351
14b6b7c8-b752-456b-89fc-8d4a2039a409	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:19:09.359
22f3b89b-9c08-4fc5-ac63-160de2697495	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:20:09.441
8b27251e-8650-4df7-a68d-ded974fd140b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:21:09.347
b60af9d1-082e-411c-ba5a-c976dac94b41	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:22:09.362
4fbca039-f46d-4c00-93c3-a35166886ba0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:23:09.36
64a436eb-55a2-4a82-87bf-3c61bb066fcf	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:24:09.349
f4e30b03-622d-4b8c-928c-cb77e1793d5b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:25:09.362
d9520c9a-a4c6-41aa-ac7b-118672b9a5cb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:26:09.423
d4cca703-63d0-4ceb-99ab-9681c21e40b2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:27:09.403
c3236490-71fb-45d9-9419-b784dd82c0cc	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:28:09.354
65c8ff6e-2c82-43ed-93da-2328ac68dd04	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:29:09.351
6be2bcac-a02b-4ba8-b995-bd2d54005115	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:30:09.35
8214b7e5-84cd-4e09-9043-6f3730657be3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:31:09.358
69b809f2-184c-492d-a61e-2f635817e39a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:32:09.432
a94f5a61-a1d0-4822-9289-79db3b1a1d1c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:33:09.365
a16d21ea-45f8-446c-9113-284920ae0146	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:34:09.348
3c3fa567-fe51-457a-b069-a6eed8b72997	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:35:09.359
2db4a33b-11d1-403b-ac3f-f30888a3f0ad	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:36:09.357
8ed29bd4-4d30-4acd-be99-e228a68541d6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:37:09.36
2af9f9d1-e8cf-4d38-bcdb-87b9f0b93db8	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:38:09.434
950112c8-f931-4b4a-b7b5-849dc23692f4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:39:09.348
2317e5f9-f4aa-44e2-972e-1cbf98c7f7d5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:40:09.36
0c01d068-441e-4679-ab1c-eb8eb3414e12	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:41:09.357
65598b17-204c-4595-8405-29b48a2ebf53	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:42:09.385
b886d67d-6291-4764-b567-a48d9a57b2ae	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:43:09.354
42e24676-9c06-4882-aa65-e16254388e26	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:44:09.418
99f97722-7c94-4234-8b2b-41e3277116b0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:45:09.348
6b28fd17-b797-4df1-9223-76107d6fb8ae	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:46:09.357
657fbc13-c609-4355-b702-b20981d0f3a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:47:09.352
eb8ffab4-be77-4645-b826-d262e89261dd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 10:48:09.362
4e7ed31e-eb25-4892-804f-b98ced862833	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:32:59.354
49f162a0-2602-418b-86ce-4a3687dda0dd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:33:15.375
8fa534a0-d8b5-40c5-9ea2-b6041b51f2c9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:33:45.351
07f26243-4f15-4539-9540-ec855c71b32c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:34:15.349
52d7fad3-420a-4bc8-bfee-eb479b28eace	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:34:45.353
666e2dc0-a6fe-4f13-ae4d-a1bd7beb8bf9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:35:15.351
34661765-9939-4fd7-a65b-53a2e8912ec9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:35:45.355
2a3372d0-73e6-438d-a0a5-1af43a7b93a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:36:14.586
251b033e-eb51-47ae-b2e0-b3a5ad61364c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:36:25.559
bf9ca3ce-0ccd-4a5f-94e7-551bfa2aabf2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/e9359b5f-7db9-4f18-aefd-a8695f2e413d/upload	POST	2026-05-21 11:36:27.757
ff2d3466-7ef9-4202-aeba-26a023b1e0b1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:36:45.353
2bd12720-3659-4e07-8b53-a3c6a97309a7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:37:14.597
e21a6c49-caff-4712-bac7-e98f1c3d9465	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:37:45.514
507614a4-cd0c-42c7-a367-1447732ad6fa	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:38:14.695
c7b94439-9532-48fe-940f-ed50b80ca3a4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:38:20.803
9b2112fd-cbec-4da9-853c-87f704e2b9c7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9/upload	POST	2026-05-21 11:38:23.707
fb07fbf3-dde9-4cc0-90b1-ed6a15ff51b6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:38:45.357
99a34240-613a-4f0f-b691-d1c70d1b4e89	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:39:15.35
800d3341-c21c-4557-8025-e2196eea0ff0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:39:44.616
226757d8-c9b4-42d2-9418-e9a37f2d458c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:39:53.47
d8e1929c-0279-4b4a-b3ea-3254bbbdeacd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9c71218d-e2b2-45b4-82c4-6bc409deab30/upload	POST	2026-05-21 11:39:56.529
6f184839-4824-4595-bb50-b05434604871	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:40:14.579
c2fb167e-47ae-4d1d-983c-3799a6769350	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:40:44.608
14f4fe13-c264-45e7-86c6-3af7e20d2eb9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9c71218d-e2b2-45b4-82c4-6bc409deab30/images/2a27c594-15ce-4cd5-9930-211c33e342c4/primary	PATCH	2026-05-21 11:40:48.48
5d8f47d9-02ca-4db6-a13b-863ea2e98724	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:40:53.234
4abed831-6c01-4c68-b2da-c66e326e9fea	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:41:23.362
f96bae40-8d31-47ea-a70a-e4d3afbdf1d4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:41:53.351
ceb89470-a7ea-46bc-9177-9b478ce1eace	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:42:20.755
17ac0151-a953-4c80-970e-f6603352ee7d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/796e9a56-15cc-4714-bb85-e3d6c1f91683/upload	POST	2026-05-21 11:42:22.931
3c22f2dd-b028-49e2-adb7-507d86031319	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:42:23.219
8f55e9d1-fe3e-4779-9a17-3244f9725440	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:42:53.347
fda72f73-4389-4b33-93fe-4faed66372b9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:43:23.22
b74809ec-4968-46f0-8de6-e96651be5b6a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:43:53.424
973f1313-25d4-4618-a148-b9dcf51bd9cd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:44:23.224
d27479f0-b5bc-4e52-9145-8857fa809e27	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:44:45.257
371b3f72-69f2-4d74-a81b-8082ad336c7f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/fee8606c-eacb-427f-8807-5f6213f88afd/upload	POST	2026-05-21 11:44:47.169
d10c8c37-dc04-4bf1-bf8e-48bd92bc9a5f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:44:53.235
9d001161-669d-4c36-8f12-3047c6632924	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:45:23.221
e8545e10-529f-4012-a6fa-6c52e0702885	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:45:49.001
8369a061-b1f1-4c7c-bc19-ce2ff4d3bc0f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/cc9f0adb-1cd7-46a9-bc5e-74733adfb16c/upload	POST	2026-05-21 11:45:51.383
6368e039-2fe3-4e40-b038-853911081934	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:46:23.232
9d14c89a-d81c-48e6-968f-fbf99207b0a5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:46:53.238
6564e518-8def-4d43-8306-8375ed90d1cd	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:47:23.221
8f40a0b2-a2ce-4ba9-86e2-b948c736e4b3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:47:31.718
b99b4916-2c07-44b0-a479-c1ce7bc58e83	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/14754302-9e0f-4419-b8f1-0f5d6e6e21a1/upload	POST	2026-05-21 11:47:34.393
fa4f4668-7b22-4d1d-8e77-2e01fedccac2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:49:23.235
f02f4225-d831-49ee-a86a-878f15cad010	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:45:53.22
c79cdc6a-ca0c-44e9-8bf5-a2022f4e9be9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:47:53.357
8461e695-5658-410d-a1ee-5c82a8710ce2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:48:23.4
69014a5c-2416-42c5-868b-c9648280123d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:48:48.761
6dc970c9-ac00-4798-b236-53552d1a03b5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:48:53.229
a0bfef64-436e-4a05-9431-7170e1326474	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/50c35079-75e4-4e64-9531-752c1e41705f/upload	POST	2026-05-21 11:48:53.674
236e0245-ec21-4a4b-861d-cdd432ab0116	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:49:53.299
661f5a03-e190-4fec-90f7-ea65333016f9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:50:23.226
e5d9531c-aaf5-47ed-b6d0-573a1d4bea88	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:50:53.354
a1455bdd-1df6-4880-bbbe-a6d781c17cb9	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:51:23.346
7b336c9c-9b17-4324-ab24-4ae4003374f4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:51:53.225
b8714290-0ff6-492e-aa78-d8e9578e88b3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:52:02.86
758be2f2-96ca-4b0f-889a-aa168efa695b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6176c2a5-1313-4510-8a82-f468a30c7360/upload	POST	2026-05-21 11:52:05.257
882255df-d0b5-4323-acba-546c4d296b44	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:52:23.354
8c8054a4-15b3-4413-a1c6-7fe783dd77ca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:52:53.347
f4750b3d-414a-4470-9943-dab9c013416f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:53:23.216
33f91765-8f46-4f51-8463-73e5ca9969e7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:53:31.109
c29a3ce3-4153-42d6-8bd0-43047b52ed07	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/6200cfd7-34c8-4f4d-8a7a-1e7269036d13/upload	POST	2026-05-21 11:53:33.301
04f74dbd-ccc4-4b02-ab9b-fe4c1fade8f6	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:53:53.366
50b49279-61d2-49dc-b667-0b75c734c8c3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:54:23.411
9fee2657-8c25-4b30-ad4f-639b5231ddf7	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:55:09.343
b85226ca-cc44-4d4d-b35a-0b48d394ff34	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:55:49.381
e1da665d-70b8-4cc2-aa46-41ef81c5f74c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:55:53.225
49573b38-fd4a-443e-a14f-c16da16063d5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:56:23.228
5361fb32-ad1b-48a9-8729-7b4ed7b4cdc3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 11:56:25.565
0e570f67-ee51-4123-a1bd-73b70f7f4b8f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/50268195-45d5-4cd7-be3e-91f1f249bc22/upload	POST	2026-05-21 11:56:28.208
795d80ac-a0ef-4cbd-8e80-6848cf35e08e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:56:53.236
ab4fefc8-d905-4f37-8e8c-f4e7451a0163	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:57:23.232
0eb9de3a-df55-40a0-ac61-da43e4610f8a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:57:53.405
949e816c-8c5d-4735-b940-a3748b9a152b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:58:23.346
c642d2b6-69ca-4364-a76e-d28d38fde503	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:59:09.351
b3311bf4-1ad0-474b-8b04-d7fbf1588cca	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:59:45.692
f3616270-5554-4839-b54b-bd9fc410a456	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 11:59:53.228
2974b1e4-927f-4f62-ace1-8acd8c68f0f0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:00:23.238
38197646-8b5b-4ba7-b345-f22752c02ac3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:00:39.459
431a18b6-4f7b-4991-8d16-65162074e09e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/0e280f36-d54e-4b1a-93dd-4067c020bea7/upload	POST	2026-05-21 12:00:40.982
8c3de340-9e5b-43df-84c0-a1bb2bd59d1f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:00:53.241
7f86bd17-6e34-46ce-ad42-373ef2c43f75	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:01:23.359
60bad6aa-083f-4a79-89c2-4a541e5d1e46	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:01:53.354
56d93c55-1c49-4d89-9437-3fabcf67866c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:02:23.217
4d9fecf5-619b-498a-95fc-2d9e1a57ca5b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:02:51.355
fb3d96a9-5ae6-40a3-9e48-e5eb41ec5b2d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:02:53.373
b6e6810c-8da9-4b88-bdaa-3532dc41a814	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/2dcc7110-b084-4b84-84de-d5e84bc7d430/upload	POST	2026-05-21 12:02:53.776
3b02d3c4-4332-44d9-a978-a46e65b7a477	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:03:23.393
0fa8b04b-7832-4d93-adde-485bb4575780	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:03:53.223
fbeaabd5-114e-4b23-92d7-33b623efe717	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:04:02.932
d6a3d162-bf0c-4995-8c26-18c4ff92a9f4	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/071f40e6-c400-4f01-a1c6-cf0d93cec0e5/upload	POST	2026-05-21 12:04:05.317
eb3b2de1-cd34-4f6c-869f-4bf01d6ee6db	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:04:23.344
6a29d62c-4ae8-402c-b0f3-e935935ce7fe	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:04:53.225
e7aa2de4-736f-4aa7-996f-af8162636e66	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:05:22.594
98cbabed-3255-4938-98ee-e473c7ec5065	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:05:23.236
f268132a-5560-465e-ab0b-062aed1901ad	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f7b1cd79-08af-49f5-93c1-ae83c32977b9/upload	POST	2026-05-21 12:05:24.555
043dceba-bf5d-41dc-8ce7-a6a7f5133e99	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:05:53.423
c069a942-fa92-4e3c-a554-e2a595f9df63	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:06:23.367
482dfb50-aa69-4ea3-a047-44d25c61e02b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:06:52.19
568f8e3f-44dd-4fed-a399-ea0ca3db1d53	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:06:53.233
9df24835-7012-4d81-ac89-b99123d1838b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/93dc4b66-f386-42a1-9dfb-9cb8f484e11a/upload	POST	2026-05-21 12:06:54.535
37cfc84a-d0fc-4d3b-81c0-63c4d8a74e3a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/f7b1cd79-08af-49f5-93c1-ae83c32977b9	PUT	2026-05-21 12:07:05.875
40d19db6-0e62-4a03-9d1b-f313515a9e27	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:07:23.348
5d8c4c60-a82d-4a80-95f5-93769fee2cbb	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:07:53.221
905b0622-aa1e-4280-abc7-bc710ac01fb0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:08:23.33
217bb142-8818-496d-b035-45a27524bc51	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:08:46.836
1f12acaf-f887-4917-988d-29b87c929960	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/9251db4c-b9bf-474d-bf4a-b8b2971f1067/upload	POST	2026-05-21 12:08:50.337
736d3f58-8a1f-4fba-bc53-48c7c3ddeaa1	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:08:53.217
8c652405-b6a6-4356-95c4-394138181381	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:09:23.351
aeb7f410-1c8a-454a-b04b-9d22e9f8fc1c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:09:53.351
0df05a4a-4af8-4b66-8b16-10dec92d8a8d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:10:17.891
dfd0b2f6-b7ea-4941-a85b-706050620655	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/da43852a-66b7-4c5d-a92b-812c6b985327/upload	POST	2026-05-21 12:10:20.193
f563a0be-8e9a-45a6-a5f5-1995dc92e622	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:10:23.215
76e8185f-f596-4513-ae4b-2cdd853c6234	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:10:53.351
8e96b0d4-d5f5-4a7d-a283-bc4995cc8859	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:11:23.351
05cd8955-3107-43ce-8a13-e5fe7aaccae0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:11:51.601
4b02ed90-4c62-45fb-bfa7-39f7c22e8d1c	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:11:53.223
7ff0c3da-661a-49f8-8c5d-70c78be34db3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/db4dc78a-a17c-4b70-9e3e-0d48594194e6/upload	POST	2026-05-21 12:11:53.629
8aa108b6-66e4-4f0c-9aff-65c4962c5f2e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:12:23.39
c9dc8164-219c-4c8d-b5c1-a7dc7fd99ce0	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:12:53.349
3bed20e4-bec9-42c0-8d87-9e2168ed5a8a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products	POST	2026-05-21 12:13:14.651
79eb1339-5b87-4726-96bd-0628d7d4edb3	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/products/c91b1cc7-491d-4a43-aa66-5131db286ded/upload	POST	2026-05-21 12:13:17.391
b922174c-dfcb-4da3-ac0a-a293753235a2	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:13:23.225
90c5fc20-fe77-4837-9b99-1d632c54ebe5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:13:53.291
1f3e419c-ef99-41fa-8225-599f3fe9de9b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:14:23.222
ba90871f-19d6-4ee1-9136-0c5769ccbc80	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:14:53.223
6c19fcd6-421d-44c4-b2c7-45dd5216778e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:15:23.222
3cbb32b7-a2ec-483f-b92c-f647c5820819	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:15:53.355
5161bb60-d528-4de7-a440-bdb56b81e8ba	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:16:23.359
6d02676f-818b-4407-87f1-220632e03e3a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:17:09.354
d7fb2cdb-9d47-4102-baa0-b83067e1348a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:18:09.355
435f5959-3eec-43df-95cc-c41564a21d90	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:19:09.452
cf32c0a5-8802-4abe-a0c6-129bff6e785f	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:20:09.344
bc722bbb-5229-4c12-ba71-957d60a5709e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:21:09.374
8ba2f630-de75-4cfc-bea2-360eb3f8df70	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:22:09.355
2cebb174-4b8d-4257-a69c-df41a1a67f9d	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:23:09.354
20de7592-7970-4da6-b5c4-ba5408051490	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:24:09.35
65144cee-77e7-4941-92d5-2de6a098b14b	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:25:09.448
467fb6f5-4faa-479c-9822-cb74687717a5	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:25:26.998
566fa3cd-3134-4866-a3dc-25c38c25d351	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 12:25:29.472
1d873923-bdde-4a4f-a97e-44283150f489	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support	GET	2026-05-21 12:25:29.552
9b07d2a3-b799-489f-8d2c-b15260b7835a	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 12:25:31.1
5d1a2068-eb35-4330-9232-28ee17c0947e	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/ai/admin/chatbot/history	GET	2026-05-21 12:25:31.118
0531aef0-db11-4ac7-8246-5530a984df70	36b9da24-5480-4a54-bb8f-5c54cf3264ae	SYSTEM	Response Status: 304	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	/api/support?status=OPEN	GET	2026-05-21 12:25:53.364
\.


--
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Banner" (id, title, subtitle, "imageUrl", link, "isActive", "order", "createdAt", "updatedAt") FROM stdin;
e0538d65-e2dd-412d-9c42-933992e53f1a			https://res.cloudinary.com/do8svjo8h/image/upload/v1776860957/banners/vo0hu9k44fipepfojy2p.jpg		t	0	2026-04-22 12:31:00.469	2026-04-22 12:31:00.469
b396df9e-b320-44c5-8c0f-df5c85f76fc5			https://res.cloudinary.com/do8svjo8h/image/upload/v1776861734/banners/scabqpwtkcsir3d3wmj2.jpg		t	1	2026-04-22 12:42:17.29	2026-04-22 12:42:17.29
5e1021ac-1aa5-4935-8cfa-446bb6977178			https://res.cloudinary.com/do8svjo8h/image/upload/v1776861808/banners/p3hrql2ne1z4dxh6ffee.jpg		t	2	2026-04-22 12:43:32.504	2026-04-22 12:43:32.504
85f519f5-4782-4d7a-a23c-d1f5d9a19285			https://res.cloudinary.com/do8svjo8h/image/upload/v1776861820/banners/bcnthobpeq84c7fdbip1.jpg		t	3	2026-04-22 12:43:42.173	2026-04-22 12:43:42.173
dfdfd014-8656-4d29-9598-cb5117a24d9d			https://res.cloudinary.com/do8svjo8h/image/upload/v1776861833/banners/ezrm3iwcuf4cgkjdkcn0.jpg		t	4	2026-04-22 12:43:56.51	2026-04-22 12:43:56.51
ab8408d3-2851-4fc0-9ce8-be854224c72e			https://res.cloudinary.com/do8svjo8h/image/upload/v1776861844/banners/pzvcyq6b1g57glk8eirc.jpg		t	5	2026-04-22 12:44:05.826	2026-04-22 12:44:05.826
f80182b1-07f8-4540-afe7-17aac588dfa9			https://res.cloudinary.com/do8svjo8h/image/upload/v1776861856/banners/rzzultoxfo1soh8e1are.jpg		t	6	2026-04-22 12:44:17.038	2026-04-22 12:44:17.038
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Cart" (id, "userId", "productId", "productVariantId", quantity, "createdAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Category" (id, name, slug, "parentId", "isDeleted") FROM stdin;
b82d5ea1-db3a-4630-9803-45dfbfa82ce0	Gaming Gear	gaming-gear-R2xx	\N	t
b7079621-c838-4e4a-a725-7750e2e31c5e	Điện thoại	ien-thoai-U_Gw	\N	f
5ced1805-e014-4eae-a4fb-af7d1e90ff64	Máy tính bảng	may-tinh-bang-NF1b	\N	f
e5fd2be3-07f8-40ad-a081-7a3b220c3552	Bếp & Phòng ăn	bep--phong-an-4D_i	\N	f
c1469243-f1d4-42e6-90da-1664a015cdfc	Thời trang Nữ	thoi-trang-nu-M6J9	\N	f
df278796-7010-4462-adea-f59b64b12423	Nội thất	noi-that-nYpr	\N	f
4ab98079-550b-45f0-83b7-6aec19e7ccb5	Thời trang Nam	thoi-trang-nam-kGvi	\N	f
6cf378c7-d41b-4279-aa96-a19d98111de8	Laptop	laptop-aJBW	\N	f
0ecddf00-9df1-4fa3-952e-960cd640ff5f	Giày dép Sport	giay-dep-sport-bOJi	\N	f
e7ebe5ce-d6b7-491e-89c8-61fbcfa5a93e	Máy ảnh	may-anh-MXoR	\N	f
323b8bb1-af0d-455f-ad7a-44a513de56a5	Tai nghe	tai-nghe-UJAz	\N	f
2031fd2d-8222-4b06-bb5c-c0b64792be13	Phụ kiện	phu-kien-1YBY	\N	t
d237c001-028f-4e01-977a-0621ef68678e	Đồng hồ thông minh	ong-ho-thong-minh-ZcbP	\N	t
e7146aa8-38a5-448c-9838-4e2ac2531e46	Sách	sach-n6Vt	\N	t
fd492d86-0039-4caa-9520-ae6b47f42b0c	Gia dụng	gia-dung-o4nL	\N	f
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."ChatMessage" (id, "userId", role, content, "createdAt", "suggestedProducts") FROM stdin;
\.


--
-- Data for Name: GlobalNotification; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."GlobalNotification" (id, title, content, type, "isActive", "createdAt", "updatedAt") FROM stdin;
7c3292c1-8261-4341-bc46-89aa18ffb63f	KHUYẾN MÃI CUỐI TUẦN	Voucher ưu đãi đến 60% giới hạn 5 mã\nNhập ngay:CUOITUAN\nÁp dụng cho đơn hàng trên 1tr đồng	PROMOTION	t	2026-04-23 06:30:00.763	2026-04-23 06:31:07.018
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Notification" (id, "userId", title, content, "isRead", type, "createdAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Order" (id, "userId", status, "totalAmount", address, phone, "createdAt", "updatedAt", "voucherId", "cancelReason") FROM stdin;
c1c7c5bf-b768-4d8b-bb5c-0934fc963fb0	468fbcfc-4572-418f-b4e9-678d86bf42fc	CANCELLED	16204160.00	401 Đoàn Mills Suite 562	025 2792 1317	2026-01-29 21:53:48.983	2026-05-20 07:06:11.134	\N	\N
a593e85c-1fde-4e1c-a3c4-a4f7454fd63b	d3cd34c3-142a-4936-bd97-f07cb87d8f36	DELIVERED	39288217.00	7664 Hồ Forge Suite 384	027 6088 0046	2026-04-27 15:34:54.597	2026-05-20 07:06:11.229	\N	\N
f294f1fa-17d4-4cd5-820d-aaf3d8dabeff	6d9aae79-2172-4c6e-9b06-7fb688e7ef26	PENDING	2872882.00	306 Nguyên Thảo Garden Suite 640	0218 9842 2064	2025-11-12 00:47:07.06	2026-05-20 07:06:11.237	\N	\N
b460620f-fa96-4310-8ff3-dab3fdfe3247	468fbcfc-4572-418f-b4e9-678d86bf42fc	DELIVERED	30855944.00	914 Đỗ Highway Apt. 481	0296 0901 2178	2025-06-05 15:44:37.112	2026-05-20 07:06:11.245	\N	\N
ecb37bcd-b5fd-477a-b3ba-fd0f6ab89502	ce00b000-f3c5-431e-b240-1218037da648	SHIPPED	19593047.00	33598 Ánh Xuân Union Suite 515	020 8870 1215	2026-04-29 15:06:07.459	2026-05-20 07:06:11.253	\N	\N
31c5df3e-0979-4490-a360-61a024ce2757	0db93408-c030-47de-a5ec-29951bb7a933	SHIPPED	16685089.00	3784 Bạch Cúc Extension Suite 120	028 1251 2254	2025-11-26 07:24:04.66	2026-05-20 07:06:11.261	\N	\N
9c408f46-dfa6-4a1f-8f9b-42e39d63b4d1	b05028d4-4417-4727-a2e5-8c2371306cd3	PROCESSING	13275974.00	644 Vĩnh Long Mountain Apt. 737	0224 0713 6153	2025-11-17 05:09:06.449	2026-05-20 07:06:11.269	\N	\N
7c3c3df1-ccd3-4435-85f3-19f6ce3b3690	468fbcfc-4572-418f-b4e9-678d86bf42fc	PROCESSING	19210294.00	98749 Trịnh Hills Apt. 890	022 0335 3820	2025-12-31 19:28:03.139	2026-05-20 07:06:11.277	\N	\N
74959092-d28d-4bbb-949b-74a79f2a4898	1e6830e9-6027-499d-9f99-bbdfe76479c3	SHIPPED	4908752.00	4767 Tài Đức Locks Apt. 677	023 4676 1947	2026-01-17 03:38:22.07	2026-05-20 07:06:11.285	\N	\N
4e2866b5-d28f-4691-913a-f56177d19013	ce00b000-f3c5-431e-b240-1218037da648	PROCESSING	23014799.00	9080 Phúc Sinh Estate Suite 829	021 1034 9524	2025-11-24 06:13:35.231	2026-05-20 07:06:11.292	\N	\N
803b1af0-aadd-4738-8da9-2f72737ff2b3	79748d27-c7a4-468f-b0a8-1fa50895f510	PROCESSING	6559956.00	957 Vũ Tunnel Apt. 757	027 1756 3849	2026-04-04 20:53:58.373	2026-05-20 07:06:11.299	\N	\N
9e78db98-d5cf-4ae9-9f99-382f76fa5e4e	a145ecb4-dc54-46c5-992b-359fc1b079cc	CANCELLED	6988648.00	9107 Đinh Spring Suite 942	0277 1934 5995	2026-02-23 18:08:15.811	2026-05-20 07:06:11.305	\N	\N
5c069e97-dba9-41d6-8e12-9d182ff36977	5d217592-20b4-4aa3-a9ed-adec1c8beedd	DELIVERED	22380974.00	79219 Thành Ý Union Apt. 614	0289 7378 0721	2025-08-02 13:49:02.993	2026-05-20 07:06:11.312	\N	\N
53defa15-57e8-434d-bf85-0ff020934e17	a145ecb4-dc54-46c5-992b-359fc1b079cc	PROCESSING	37888728.00	11040 Phan Throughway Apt. 282	0299 6183 5365	2025-12-30 05:34:18.311	2026-05-20 07:06:11.319	\N	\N
e5aaecaf-6d50-4023-b15f-be0c96352b7d	b1d53096-a600-43d3-8000-66568b586693	PROCESSING	5458066.00	646 Khánh Giang Streets Apt. 782	026 9288 3544	2025-07-10 06:30:48.567	2026-05-20 07:06:11.326	\N	\N
3d8e597a-ef18-4a1b-801c-1e512d283fbb	a145ecb4-dc54-46c5-992b-359fc1b079cc	PENDING	61052636.00	5704 Vân Hà Vista Suite 758	024 3170 4675	2025-09-26 08:02:45.655	2026-05-20 07:06:11.335	\N	\N
4d35b556-fad5-4df4-9d52-20f1edacdcb9	a145ecb4-dc54-46c5-992b-359fc1b079cc	CANCELLED	45998026.00	997 Chiêu Dương Turnpike Suite 568	0262 5538 7145	2025-08-08 13:15:37.742	2026-05-20 07:06:11.342	\N	\N
b8699d7f-f703-41a7-9492-1f6f73cca1d2	468fbcfc-4572-418f-b4e9-678d86bf42fc	SHIPPED	14466465.00	260 Khôi Nguyên Ville Apt. 530	028 2588 0204	2026-04-02 18:21:13.702	2026-05-20 07:06:11.349	\N	\N
b3d2d9f4-b34d-4d18-a54f-623953e92e85	918fdda5-4b4c-4eae-954c-3d2e1c07e199	DELIVERED	42459812.00	962 Dương Canyon Suite 583	028 7926 8161	2026-05-09 06:15:24.506	2026-05-20 07:06:11.358	\N	\N
cf34010a-d621-4582-baae-bfef0cc215e7	2c30fe59-c287-4d3a-b3e1-c09f6936b338	PENDING	3140015.00	60420 Vinh Diệu Cape Apt. 797	0288 5711 3289	2026-04-23 20:46:33.24	2026-05-20 07:06:11.364	\N	\N
f0469667-5e6e-4fad-ad93-117877683eac	3e381d11-e487-4943-a65c-9eab882060e1	CANCELLED	31405942.00	569 Thụy Miên Squares Apt. 699	0205 7615 2521	2026-04-25 14:19:20.428	2026-05-20 07:06:11.378	\N	\N
fa6fb265-2973-4f67-9b9c-4c1975a0ff6b	5d217592-20b4-4aa3-a9ed-adec1c8beedd	DELIVERED	2891191.00	57433 Huyền Nhi Parkway Suite 856	0275 4866 8940	2025-07-18 09:56:02.251	2026-05-20 07:06:11.386	\N	\N
4e182deb-e9c9-40da-90c3-8ab6b5dc5adb	5d217592-20b4-4aa3-a9ed-adec1c8beedd	DELIVERED	13626981.00	874 Hồng Giang Lights Suite 227	024 7563 0823	2025-06-14 10:48:26.941	2026-05-20 07:06:11.393	\N	\N
b2341c8d-21d3-4b9a-821f-7ef3dbe0ec3b	208734dc-901b-41b7-8fe6-54f76c4bf91c	PENDING	37985427.00	88439 Lê Roads Suite 516	0237 2293 8349	2025-11-08 08:24:21.897	2026-05-20 07:06:11.4	\N	\N
79ea1dd4-5047-4a86-af0f-37b497b6fbaf	5d217592-20b4-4aa3-a9ed-adec1c8beedd	CANCELLED	6797471.00	723 Tô Meadows Suite 176	020 6781 9270	2025-08-03 22:21:35.118	2026-05-20 07:06:11.407	\N	\N
f25f9050-8d41-4669-a59d-f90cc4889776	5d217592-20b4-4aa3-a9ed-adec1c8beedd	PROCESSING	12643438.00	5944 Mai Radial Suite 307	0233 3739 3420	2026-01-13 09:45:55.591	2026-05-20 07:06:11.415	\N	\N
c1dae540-c556-48b3-ac3d-467f0d6ede49	d3cd34c3-142a-4936-bd97-f07cb87d8f36	SHIPPED	11139518.00	1376 Trịnh Ports Suite 987	0210 7289 1909	2026-02-07 03:06:20.3	2026-05-20 07:06:11.425	\N	\N
990098dc-233a-4c72-99c8-539af34a72d7	90b2a1d7-109e-4aa9-9bc8-4e25f0758d01	PROCESSING	17031354.00	840 Khánh Hòa Pass Suite 696	026 0451 3642	2026-02-27 16:56:13.634	2026-05-20 07:06:11.434	\N	\N
cca4f530-df59-44e7-803d-97ffb12c9423	b05028d4-4417-4727-a2e5-8c2371306cd3	SHIPPED	14485116.00	56660 Lệ Hoa Ford Suite 855	029 2855 6835	2026-03-30 02:05:02.942	2026-05-20 07:06:11.443	\N	\N
e1174723-f4fd-48d6-bbf4-9ccfb514de38	208734dc-901b-41b7-8fe6-54f76c4bf91c	PENDING	28384408.00	42429 Thi Ngôn Forge Apt. 117	022 4061 6774	2025-08-29 08:35:13.466	2026-05-20 07:06:11.45	\N	\N
953ed80d-2a70-41d9-9853-35c4e8ec16bb	cc36173e-5ff1-47a2-bd5b-704a4e8523e4	PENDING	10871056.00	45602 Hoàng Haven Apt. 643	021 9563 8675	2026-02-21 03:50:24.119	2026-05-20 07:06:11.459	\N	\N
cef50f33-5381-4e3b-8651-38ea8c25bf27	ce00b000-f3c5-431e-b240-1218037da648	PENDING	35823319.00	2473 Thúy Hường Ports Suite 582	029 8637 5516	2026-05-11 08:15:48.048	2026-05-20 07:06:11.47	\N	\N
078a57cf-4118-47bc-b842-98efdbb394c1	fc8fed6c-9510-4a20-a380-a69fa4ffd1c2	CANCELLED	23415818.00	962 Hoàng Track Apt. 724	0281 1131 7022	2026-02-08 12:57:19.308	2026-05-20 07:06:11.479	\N	\N
92b70d6f-ef51-4048-9818-bb199d9d9a02	ef3d3c28-bf87-45e7-9915-af9b3b069849	CANCELLED	22406090.00	591 Ngô Springs Apt. 273	0257 1506 1991	2026-02-26 19:55:43.62	2026-05-20 07:06:11.489	\N	\N
2f0d7069-a448-4260-b126-8cbd96a61323	e8aa61fc-a892-480d-b93d-7dec830e9526	DELIVERED	27895543.00	3879 Bình Hòa Creek Apt. 477	0267 1038 7247	2026-03-27 13:04:06.408	2026-05-20 07:06:11.496	\N	\N
5bf97514-2512-4d17-bb2d-84a11d1214ff	42ace291-6954-45bd-aa56-dd4e80f32aff	SHIPPED	27607157.00	8644 Đào Junction Suite 581	0290 6983 6032	2026-02-16 19:08:51.539	2026-05-20 07:06:11.505	\N	\N
b52b10aa-9028-4796-b56b-61ae0db38fea	540c29f8-c5cf-468f-92b0-7382e9a42c1c	CANCELLED	12031934.00	588 Thủy Tâm Crescent Suite 717	028 9744 8922	2026-01-21 09:00:46.542	2026-05-20 07:06:11.512	\N	\N
d0f1c957-5a5e-40c6-8c61-cbab2be52ad5	ef3d3c28-bf87-45e7-9915-af9b3b069849	PENDING	9020228.00	6076 Mạnh Nghiêm Motorway Suite 992	0249 5449 6706	2026-03-11 21:32:30.762	2026-05-20 07:06:11.519	\N	\N
a559b7d3-c61a-47fa-9f31-a4eea149f38f	6f35a644-4e28-478a-9225-45bbfb6830dd	PROCESSING	17560467.00	727 Công Luật Park Apt. 849	0279 7484 7549	2025-06-02 10:01:30.372	2026-05-20 07:06:11.527	\N	\N
257bd2c1-74f3-4d9d-8413-4cd94b31b3f1	ad76e690-1e14-4340-bb82-0a177b93d558	PENDING	16748008.00	213 Thương Thương Ridges Suite 639	0273 2651 3862	2025-08-17 13:42:36.302	2026-05-20 07:06:11.534	\N	\N
cd94e082-0e8c-43ee-b7d8-ea76a12cbde5	01fb0885-c61b-4813-8059-8829f52c59d1	DELIVERED	30970386.00	708 Trịnh Canyon Suite 167	0202 1873 5600	2025-09-28 12:44:48.584	2026-05-20 07:06:11.54	\N	\N
60c7e276-ee40-4ab5-910f-51256876ce51	918fdda5-4b4c-4eae-954c-3d2e1c07e199	DELIVERED	8607290.00	74527 Ngô Flats Apt. 864	0285 4221 8869	2025-06-30 21:34:02.895	2026-05-20 07:06:11.547	\N	\N
172f4091-373a-4c85-bbf7-7a88c3803140	ef3d3c28-bf87-45e7-9915-af9b3b069849	CANCELLED	4908752.00	72141 Thanh Thu Brook Suite 989	022 2935 2382	2025-12-16 07:48:47.678	2026-05-20 07:06:11.554	\N	\N
68383114-49ff-46cb-9049-511c7b298f5b	ad76e690-1e14-4340-bb82-0a177b93d558	PENDING	9516655.00	6678 Lê Landing Suite 829	0257 6172 0027	2026-05-19 23:27:14.295	2026-05-20 07:06:11.56	\N	\N
f32d7bec-1cce-4a0d-b660-d13d9f11cf94	5bfce06a-1aa2-4f3d-b68d-9c87612ada8d	PENDING	4566358.00	3324 Thiếu Cường Stream Suite 556	0214 3686 6983	2025-06-20 04:39:15.744	2026-05-20 07:06:11.576	\N	\N
8b9fabf1-63f6-466e-8cda-e0b0fc12769b	0fca0d53-0618-4c94-9c00-ab9473663923	PROCESSING	15757152.00	38681 Lâm Loaf Apt. 798	023 9288 7140	2026-03-07 11:48:45.641	2026-05-20 07:06:11.583	\N	\N
72581ee9-35c9-4acb-8c29-cccaa50d07d5	1e6830e9-6027-499d-9f99-bbdfe76479c3	PENDING	8086420.00	16359 Hồ Isle Apt. 681	0233 7788 4201	2025-06-24 06:56:00.444	2026-05-20 07:06:11.589	\N	\N
bc861df9-5ef2-413d-b2c6-65f4c36e951e	133431c3-2de6-4569-bfbb-829cb09dcce6	SHIPPED	8944679.00	88617 Thụy Vân Spur Suite 453	0219 5112 5171	2025-10-03 13:47:17.997	2026-05-20 07:06:11.596	\N	\N
4e538d2e-7f68-4f43-8d86-02613949cb35	b1d53096-a600-43d3-8000-66568b586693	PENDING	7695311.00	6636 Hải Vân Parkway Apt. 774	024 8753 7069	2025-07-13 02:20:41.649	2026-05-20 07:06:11.602	\N	\N
e86cb74b-3e1b-48ff-85f8-692ffa53755c	00776389-2ab9-4efb-b0f4-18f69bb7dc78	PROCESSING	32770037.00	441 Đông Vy Park Apt. 699	026 0368 6134	2026-03-13 23:08:56.334	2026-05-20 07:06:11.609	\N	\N
6c98f81e-3c8f-47c9-af0b-47803737b5e5	00776389-2ab9-4efb-b0f4-18f69bb7dc78	SHIPPED	793114.00	4331 Tú Ly Underpass Suite 699	025 3688 2582	2026-01-03 16:21:12.264	2026-05-20 07:06:11.623	\N	\N
c972a655-641c-4a89-a84b-e339e94177f0	08053cad-fcce-401b-8989-73e0a0b420c4	CANCELLED	578440.00	7826 Duy Hiếu Place Suite 758	028 9698 9423	2025-05-24 01:23:37.467	2026-05-20 07:06:11.63	\N	\N
2469af66-fd6e-4c86-9499-8d71deaa4850	14e9cd12-ad94-4420-9ab8-9d0a324284a6	PROCESSING	2106587.00	530 Lê Expressway Apt. 453	0268 3344 9883	2025-12-20 07:30:52.378	2026-05-20 07:06:11.636	\N	\N
83322ce2-9e1e-435c-bc46-d914dea0481c	3d651d43-eac9-445a-b6b3-ee02ad85b512	DELIVERED	10654359.00	927 Phùng Meadow Apt. 805	0213 2948 4409	2025-09-24 12:10:43.528	2026-05-20 07:06:11.642	\N	\N
c3fad191-5507-40b8-b2e9-a37e139d71bc	d9294a70-662a-4ac3-bf6a-3315d7384ea1	SHIPPED	28594054.00	40029 Thiên Hưng Trail Suite 847	0262 4221 9617	2025-09-23 00:31:28.834	2026-05-20 07:06:11.648	\N	\N
4f81374a-b24f-4c6c-bd5d-29686862a9ec	e8aa61fc-a892-480d-b93d-7dec830e9526	PROCESSING	16700103.00	73702 Duy Nhượng Parkways Apt. 747	0297 9884 1294	2025-09-21 15:11:26.434	2026-05-20 07:06:11.655	\N	\N
1b26d874-62a3-4525-bd51-1043fd3c3979	6f35a644-4e28-478a-9225-45bbfb6830dd	CANCELLED	824789.00	22625 Ngô Glens Apt. 174	028 4527 1215	2025-11-23 13:45:54.859	2026-05-20 07:06:11.662	\N	\N
81474a1a-52ce-40c9-aff4-60d76373ccab	14e9cd12-ad94-4420-9ab8-9d0a324284a6	DELIVERED	26211334.00	9941 Lâm Highway Apt. 759	023 5562 6702	2025-05-27 15:35:58.876	2026-05-20 07:06:11.669	\N	\N
5882819d-2c13-453e-b950-432a309ae5cd	b05028d4-4417-4727-a2e5-8c2371306cd3	DELIVERED	21654129.00	37913 Ngô Oval Suite 700	022 4036 8829	2026-03-15 16:55:29.938	2026-05-20 07:06:11.677	\N	\N
c36d4613-d548-488b-9e54-132186b57899	3e381d11-e487-4943-a65c-9eab882060e1	SHIPPED	9738674.00	1805 Huệ Ân Ramp Suite 503	0286 2516 3925	2025-06-08 04:28:37.185	2026-05-20 07:06:11.685	\N	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."OrderItem" (id, "orderId", "productId", "productVariantId", quantity, price) FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Payment" (id, "orderId", method, status, "transactionId", amount, "createdAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Product" (id, name, slug, description, "categoryId", embedding, "createdAt", "updatedAt", "isDeleted", "imageEmbedding", "isActive") FROM stdin;
49189589-4122-41b9-9f55-2cd9954d0141	iPad Air M4 13 inch (2026) - Purple, Wi-Fi 128GB	ipad-air-m4-13-inch-2026-purple-wi-fi-128gb-70eebq	Màn hình: 13" Liquid Retina IPS\nCamera sau: 12MP\nCamera trước: 12MP\nCPU: Apple M4\nRAM: 12GB, bộ nhớ: 128GB\nHệ điều hành: iPadOS 26\nTình trạng: Hàng New, Chính Hãng	5ced1805-e014-4eae-a4fb-af7d1e90ff64	\N	2026-05-21 08:46:04.129	2026-05-21 08:46:04.129	f	\N	t
24736bc5-5851-46ce-941e-5c69cbb20914	Giày chạy bộ nam Asics Sonicblast	giay-chay-bo-nam-asics-sonicblast-j30r7y	\N	0ecddf00-9df1-4fa3-952e-960cd640ff5f	\N	2026-05-21 09:11:26.324	2026-05-21 09:11:26.324	f	\N	t
1949fb1b-6b79-4c63-a319-4b83faa87f2d	Giày chạy bộ nam Asics Magic Speed 4	giay-chay-bo-nam-asics-magic-speed-4-jun9ri	\N	0ecddf00-9df1-4fa3-952e-960cd640ff5f	\N	2026-05-21 09:11:51.137	2026-05-21 09:11:51.137	f	\N	t
e9359b5f-7db9-4f18-aefd-a8695f2e413d	Máy tính bảng Microsoft Surface Pro 7 i5 1035G4/8GB/128GB SSD/12.3" Touch/Win10	may-tinh-bang-microsoft-surface-pro-7-i5-1035g48gb128gb-ssd123-touchwin10-7ndyat	CPU: Intel® Core™ i5-1035G4\nCard đồ họa: Intel® Iris™ Plus Graphics\nBộ nhớ trong: 128 GB SSD\nRAM: 8 GB\nKích thước màn hình: 12.3” PixelSense™ Display\nĐộ phân giải: 2736 x 1824 pixels (267 PPI)\nTrọng lượng: 0.775 kg	5ced1805-e014-4eae-a4fb-af7d1e90ff64	\N	2026-05-21 11:36:25.514	2026-05-21 11:36:25.514	f	\N	t
071f40e6-c400-4f01-a1c6-cf0d93cec0e5	Giày thể thao đế cao dành cho nữ	giay-the-thao-de-cao-danh-cho-nu-i0k7jw	Mô tả :Giày thể thao đế cao dành cho nữ, mang phong cách trẻ trung và hiện đại. Thiết kế lưới màu trắng thoáng khí, giúp đôi chân luôn khô thoáng và dễ chịu khi vận động. Phần gót độn khéo léo giúp tôn dáng, tạo cảm giác cao ráo mà vẫn êm ái khi di chuyển. Phù hợp cho đi học, đi chơi hay dạo phố, dễ phối với nhiều trang phục. Phong cách thời trang kết hợp tính năng động cho phái nữ.\nMàu sắc: trắng, đen\nChất liệu cao cấp, kiểu dáng thiết kế xu hướng thời trang mang lại sự thoải mái, thanh lịch và thời thượng.	0ecddf00-9df1-4fa3-952e-960cd640ff5f	\N	2026-05-21 12:04:02.891	2026-05-21 12:04:02.891	f	\N	t
f7b1cd79-08af-49f5-93c1-ae83c32977b9	Máy ảnh Nikon ZF lens 24-70mm f4 S	chia-se-may-anh-nikon-zf-lens-24-70mm-f4-s-z41geh	Key Features Nikon ZF lens 24-70mm f4 S\n\n24.5MP FX-Format BSI CMOS Sensor\nEXPEED 7 Image Processor\nUHD 4K 30p Video and Full HD 120p Video\nAF Subject Recognition with 3D Tracking\n5-Axis In-Body Vibration Reduction\nFocus-Point Stabilization\n3.2" Vari-Angle Touchscreen\n96MP High-Res Mode\nThiết kế mang tính biểu tượng Truyền cảm hứng cho Hiệu suất Ưu tú\nLà sản phẩm mạnh mẽ nhất trong dòng máy quay ngược kỹ thuật số của Nikon, Máy ảnh không gương lật Nikon ZF lens 24-70mm f4 S toàn khung hình lấy cảm hứng từ người sáng tạo một lần nữa chứng minh rằng phong cách đẹp không bao giờ biến mất. Mặc dù thiết kế thân máy ảnh lấy lại cảm giác chức năng như phim, thép của các máy ảnh SLR cổ điển, nhưng bên trong của nó được trang bị các tính năng và khả năng mới nhất của dòng Z, biến hình dáng mang tính biểu tượng của Zf thành một game bắn súng hiện đại và xúc giác sử dụng công nghệ tiên tiến của nó để mang lại hình ảnh vượt thời gian.\nThiết kế nhập vai và trực quan\n\n- Gợi nhớ FM2, cỗ máy cơ khí của Nikon ngày xưa, các cạnh được gia công, mặt đồng hồ có khía và kết cấu cẩm thạch của Nikon ZF lens 24-70mm f4 S được thiết kế để khiến người dùng hoàn toàn đắm chìm trong trải nghiệm đầy cảm giác khi vận hành một chiếc máy đẹp mắt. Được làm từ nhôm được chạm khắc chính xác, các nút xoay tốc độ màn trập, ISO và bù phơi sáng có các dấu khắc được khắc để điều khiển thủ công bậc nhất. Màn trập cơ học kích hoạt với một cú nhấp chuột chính xác và có thể nghe được. Chế độ đen trắng chuyên dụng với hai công thức đơn sắc cũng có sẵn ở đầu ngón tay.\n- Thiết kế trực quan, thân thiện với xúc giác này không chỉ áp dụng cho các nút điều khiển kiểu cổ điển của máy ảnh. Kính ngắm điện tử của máy ảnh, nằm trong vỏ hình lăng trụ, vừa mắt với quỹ đạo xương cũng như đối với mắt, giờ đây có thể được điều khiển bằng cách chạm vào màn hình LCD có thể thay đổi góc 3,2 inch phía sau, cho phép người dùng di chuyển điểm lấy nét, chọn đối tượng để theo dõi và chuyển đổi giữa các chế độ hiển thị trong khi mắt vẫn tựa vào kính ngắm.Màn hình phía sau cũng có khớp nối hoàn toàn và hướng về phía trước, cho phép dễ dàng điều hướng và thao tác ở các góc cao và thấp.\n\n \n\nCác tính năng thiết kế khác bao gồm:\n- Khe cắm thẻ nhớ kép cung cấp khả năng lưu trữ tập tin linh hoạt; một SD và một microSD cho phép tràn, các tùy chọn lưu riêng biệt và lặp đi lặp lại.\n- Khung máy bằng hợp kim magie chắc chắn có khả năng chống bụi và thời tiết, cho phép bạn làm việc ở những vùng khí hậu khắc nghiệt và điều kiện khắc nghiệt.\n- Tương thích với Báng cầm từ xa MC-N10 tùy chọn và Nhả màn trập mềm AR-11.\n\n \n\nCảm biến toàn khung hình, Bộ xử lý tốc độ tối đa\n\n- Cảm biến BSI CMOS định dạng FX 24,5MP\n- Cảm biến BSI CMOS 24,5MP được sử dụng để chụp ảnh toàn diện, chất lượng hình ảnh trong điều kiện ánh sáng yếu ấn tượng và tốc độ đọc nhanh giúp ích cho việc chụp liên tục, quay phim và quay tua nhanh thời gian. Thiết kế chiếu sáng sau của cảm biến cũng mang lại đầu ra có độ nhạy sáng cao rõ ràng, giúp giảm nhiễu khi làm việc ở giá trị ISO cao. Ngoài ra, Zf còn có chế độ ảnh có độ phân giải cao kết hợp nhiều mức phơi sáng để tạo một tệp 96MP duy nhất.\n\n \n\nBộ xử lý hình ảnh EXPEED 7\n- Bằng cách sử dụng cùng một công cụ xử lý mạnh mẽ được sử dụng trong Nikon Z9 và Nikon Z8, bộ xử lý hình ảnh EXPEED 7 của máy ảnh hoạt động cùng với thiết kế cảm biến để nhận ra tốc độ lấy nét tự động nhanh ấn tượng, tốc độ chụp liên tục, dung lượng đệm cao, hiệu suất video mượt mà và tất cả- xung quanh việc xử lý.\n- Được cải tiến với công nghệ Deep Learning, máy ảnh này có chế độ tự động phân tích tình huống chụp của bạn và tự động điều chỉnh khẩu độ, ISO và tốc độ màn trập để phù hợp với ý định của bạn. Với cài đặt này, bạn có thể tự động chụp ảnh chân dung với hiệu ứng làm mờ hậu cảnh đẹp mắt hoặc lấy nét tất cả các khuôn mặt để chụp ảnh nhóm.\n- Tốc độ chụp liên tục 30 khung hình/giây cực nhanh với màn trập cơ học im lặng và tốc độ chụp liên tục 14 khung hình/giây với màn trập cơ học.\nChụp trước khi phát hành ghi lại tối đa 30 JPEGS một giây trước khi màn trập được nhả.\n\n \n\nVideo nâng cao, Tự động lấy nét và Ổn định\n\n- Ghi hình UHD 4K và điều khiển video linh hoạt\n- Chế độ phơi sáng ưu tiên màn trập mới cho phép bạn ghi hình với tốc độ màn trập cố định, thực hiện các điều chỉnh mượt mà về ISO và khẩu độ để duy trì độ sáng đồng đều trong ảnh.\n- Phù hợp với các thuộc tính ảnh cao cấp của máy ảnh, Zf cung cấp nhiều tốc độ khung hình và độ phân giải khác nhau cho mọi nhu cầu video của bạn. Có thể lấy mẫu quá mức từ 6K, có thể quay video UHD 4K với khả năng đọc pixel đầy đủ lên đến 30p và quay video Full HD 1080p cũng được hỗ trợ lên đến 120p để phát lại chuyển động chậm.\n- Ghi nội bộ trực tiếp lên tới 125 phút vào thẻ nhớ với H.265 10 bit ở chế độ âm SDR/HLG/N-log.\n\n \n\nAF nhanh và thông minh\nGiống như Nikon Z9 và Nikon Z8, hệ thống lấy nét tự động của Nikon ZF lens 24-70mm f4 S nhận dạng nhiều đối tượng phổ biến — người, mèo, chó, chim, xe đạp, xe máy, ô tô, máy bay và tàu hỏa — và sử dụng công nghệ Deep Learning để cung cấp tiêu điểm và theo dõi chính xác cho mỗi.\nTính năng Lấy nét tự động phát hiện mắt cho ảnh và video sẽ tự động khóa vào mắt người, vật nuôi và chim, ngay cả khi chúng cực kỳ nhỏ trong khung hình. Lần đầu tiên, tính năng này cũng có sẵn cho các ống kính lấy nét thủ công, tự động phóng to vùng xung quanh mắt để bạn có thể nhanh chóng xác nhận tiêu cự sắc nét.\n\n \n\nGiảm rung\n- Tính năng Chống Rung khi dịch chuyển cảm biến 5 trục trong thân máy bù cho độ rung máy lên đến 8 điểm dừng khi kết hợp với ống kính ngàm Z, cho phép bạn làm chậm tốc độ cửa trập chậm hơn đáng kinh ngạc 8,0 điểm dừng so với mức có thể mà không gây mờ hình ảnh. Ngoài ra, hệ thống này cũng hoạt động với các ống kính ngàm F được điều chỉnh khi sử dụng Bộ chuyển đổi FTZ tùy chọn, trong đó sử dụng tính năng ổn định 3 trục.\n- Hệ thống giảm rung điểm lấy nét áp dụng tính năng ổn định cho khu vực xung quanh điểm lấy nét đang hoạt động, ở bất kỳ vị trí nào trong khung hình, mang lại khả năng điều chỉnh chính xác ngay tại nơi bạn cần.	e7ebe5ce-d6b7-491e-89c8-61fbcfa5a93e	\N	2026-05-21 12:05:22.541	2026-05-21 12:07:05.829	f	\N	t
3430a0e3-d0d7-4f21-94c2-f4e793da4d3b	Máy tính bảng Xiaomi Redmi Pad 2 WiFi 6GB/128GB	oppo-pad-5-8gb256gb-wifi-ok0agr	Công nghệ màn hình:\nIPS LCD\nĐộ phân giải:\n1600 x 2560 Pixels\nMàn hình rộng:\n11" - Tần số quét 90 Hz\nHệ điều hành:\nXiaomi HyperOS 2\nChip xử lý (CPU):\nMediaTek Helio G100-Ultra 8 nhân\nTốc độ CPU:\n2 nhân 2.2 GHz & 6 nhân 2 GHz\nDung lượng pin:\n9000 mAh\nLoại pin:\nLi-Po\nCông nghệ pin:\nTiết kiệm pin\nHỗ trợ sạc tối đa:\n18 W\nSạc kèm theo máy:\n15 W	5ced1805-e014-4eae-a4fb-af7d1e90ff64	\N	2026-05-21 08:47:39.255	2026-05-21 08:51:11.53	f	\N	t
cf10d9f9-baaf-4f87-8dd6-135fcf9fb129	Dép Quai Ngang Nam Nữ, Dép Nam Đẹp Sport , Giày Dép Đi Trong Nhà Văn Phòng	dep-quai-ngang-nam-nu-dep-nam-dep-sport-giay-dep-di-trong-nha-van-phong-avryz9	Xuất xứ\nTrung Quốc\nTên tổ chức chịu trách nhiệm sản xuất\nĐang cập nhật\nĐịa chỉ tổ chức chịu trách nhiệm sản xuất\nĐang cập nhật\nGửi từ\nThành phố Hồ Chí Minh	0ecddf00-9df1-4fa3-952e-960cd640ff5f	\N	2026-05-21 09:14:24.325	2026-05-21 09:14:24.325	f	\N	t
ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9	            Bàn đảo bếp gấp gọn kết hợp bàn ăn thông minh – DBGG01	-ban-dao-bep-gap-gon-ket-hop-ban-an-thong-minh-dbgg01-y93nio	Chất liệu: Kết cấu khung bàn và mặt bàn gỗ polywood + mdf lõi xanh cao cấp chống nước rất tốt, chống ẩm mốc cong vênh, bề mặt gấp gọn chia là 4 tấm có thể gấp gọn kéo dài tùy theo kích thước sử dụng và được phủ lớp chống trầy, chống bám vân tay. Mặt tủ bàn đảo cố định là đá ceramic nung kết, có bố trí hệ thống ray ổ điện led thông minh để sử dụng khi cần nấu nướng hoặc sạc điện thoại…\nKích thước khi kéo dài (Dài x Rộng x Cao): 205 x 75 x 75 cm.\nKích thước khi gấp gọn (Dài x Rộng x Cao): 50 x 80 x 93 cm.\nSản phẩm gồm: bàn đảo bếp gấp gọn “chưa bao gồm ghế ăn và chưa tích hợp ấm nồi đun nước”\nNhận sản xuất theo yêu cầu\nThời gian bảo hành 24 tháng\nCông năng: bàn đảo bếp thông minh gấp gọn có thiết kế nhỏ gọn sử dụng kéo dài thu gọn cực kỳ tiết kiệm diện tích cho các chung cư căn hộ nhỏ cần sự sang trọng cao cấp hiện đại. Kích thước khi gấp gọn rộng 50cm khi kéo dài ra 2m phù hợp bố trí được 6 người đặc biệt tủ đảo có nhiều ngăn chứa bỏ vật dụng sinh hoạt có thể nói bàn ăn đảo thông minh này tích hợp 3 trong 1 vừa làm bàn ăn vừa làm bàn đảo và tủ chứa đồ tích hợp có ổ điện công nghệ mới, đặc biệt nhất có thiết kế bánh xe để thuận tiện trong việc di chuyển khi muốn thay đổi không gian	e5fd2be3-07f8-40ad-a081-7a3b220c3552	\N	2026-05-21 11:38:20.727	2026-05-21 11:38:20.727	f	\N	t
796e9a56-15cc-4714-bb85-e3d6c1f91683	Bàn Đảo Bếp Phong Cách Bắc Âu Hiện Đại Khanhconcept KC158	ban-dao-bep-phong-cach-bac-au-hien-dai-khanhconcept-kc158-b2opcj	Bàn Đảo Bếp Phong Cách Bắc Âu Hiện Đại Khanhconcept KC158 là lựa chọn tuyệt vời cho những ai yêu thích không gian bếp tinh tế, sáng sủa và giàu tính ứng dụng. Lấy cảm hứng từ phong cách Bắc Âu đặc trưng – tối giản, thanh lịch và gần gũi với thiên nhiên – KC158 sở hữu thiết kế gọn gàng, màu sắc nhẹ nhàng cùng những chi tiết mộc mạc được hoàn thiện tỉ mỉ từ gỗ tự nhiên cao cấp.\n\nMặt bàn rộng rãi cho phép thao tác thoải mái trong quá trình nấu nướng, đồng thời có thể tận dụng như một quầy bar mini hay bàn ăn nhanh đầy tiện lợi. Phần thân bàn được tích hợp các hộc tủ và kệ mở, giúp lưu trữ đồ dùng bếp gọn gàng, dễ lấy và tiết kiệm diện tích. Nhờ thiết kế tối ưu và vẻ ngoài trang nhã, KC158 phù hợp với nhiều kiểu nhà – từ căn hộ nhỏ đến không gian bếp mở của biệt thự hiện đại.\n\nSở hữu KC158 không chỉ là nâng cấp tiện nghi cho khu vực bếp mà còn là cách để bạn thể hiện gu thẩm mỹ tinh tế, hiện đại và yêu thích sự giản đơn chuẩn chất Bắc Âu.	e5fd2be3-07f8-40ad-a081-7a3b220c3552	\N	2026-05-21 11:42:20.722	2026-05-21 11:42:20.722	f	\N	t
93dc4b66-f386-42a1-9dfb-9cb8f484e11a	Máy ảnh Fujifilm Instax Mini 12 Blossom Pink	may-anh-fujifilm-instax-mini-12-blossom-pink-c2r46v	- Loại giấy in ảnh Instax Mini\n- Kích thước hình ảnh 62 mm × 46 mm\n- Kính ngắm quang học\n- Ống kính Fujinon 60mm có gương selfie\n- Phơi sáng tự động và Flash tự động\n- Chế độ chụp ảnh tự sướng/chụp cận cảnh chuyên dụng\n- Màn trập điện tử được lập trình 1/2 đến 1/250 giây\n- Hai pin AA	e7ebe5ce-d6b7-491e-89c8-61fbcfa5a93e	\N	2026-05-21 12:06:52.129	2026-05-21 12:06:52.129	f	\N	t
eb7fbe43-7296-449a-aa50-8c62f5b37f40	Xiaomi Redmi Pad SE 4G 8.7 inch 4GB 128GB - MTBRMPSE8.74128.BL-MTBRMPSE8.74128.BL-2 Xiaomi Redmi Pad SE 4G 8.7 inch 4GB 128GB - MTBRMPSE8.74128.BL-MTBRMPSE8.74128.BL-3 Xiaomi Redmi Pad SE 4G 8.7 inch 4GB 128GB - MTBRMPSE8.74128.BL-MTBRMPSE8.74128.BL-4 Xiaomi Redmi Pad SE 4G 8.7 inch 4GB 128GB - MTBRMPSE8.74128.BL-MTBRMPSE8.74128.BL-5 Xiaomi Redmi Pad SE 4G 8.7 inch 4GB 128GB - MTBRMPSE8.74128.BL	xiaomi-redmi-pad-se-4g-87-inch-4gb-128gb-mtbrmpse874128bl-mtbrmpse874128bl-2-xiaomi-redmi-pad-se-4g-87-inch-4gb-128gb-mtbrmpse874128bl-mtbrmpse874128bl-3-xiaomi-redmi-pad-se-4g-87-inch-4gb-128gb-mtbrmpse874128bl-mtbrmpse874128bl-4-xiaomi-redmi-pad-se-4g-87-inch-4gb-128gb-mtbrmpse874128bl-mtbrmpse874128bl-5-xiaomi-redmi-pad-se-4g-87-inch-4gb-128gb-mtbrmpse874128bl-kfejyf	Kích thước\t8.7 inch\nĐộ phân giải\t1340x800 Pixels\nCông nghệ\tIPS LCD\nTần số quét\t90Hz\nĐộ sáng\t600nits\nMật độ điểm ảnh\t180 PPI\nPin & Sạc\nDung lượng pin\t6650mAh\nLoại Pin\tLiPo\nCổng sạc\tTypeC\nSạc tối đa\t18W\nThông tin chung\nThời điểm ra mắt\t08/2024\nKích thước\tDài 211.58mm x Ngang 125.48mm x Dày 8.8mm\nTrọng lượng\t375g\nChất liệu\tNhựa nguyên khối\nCấu hình\nChipset\tMediaTek Helio G85\nCPU\t2 nhân 2.0GHz & 6 nhân 1.8GHz\nGPU\tMaliG52 MC2\nNeural Engine\tKhông hỗ trợ\nRAM\t4GB\nBộ nhớ trong\t128GB\nHệ điều hành\tAndroid14\nKết nối & Tiện ích\nWi-Fi\tWiFi 802.11 a/b/g/n/ac Dualband\nBluetooth\tBluetooth5.3\nJack tai nghe\t3.5mm\nBảo mật\tMở khóa bằng khuôn mặt\nHỗ trợ bút\tKhông hỗ trợ bút cảm ứng\nMạng di động\tHỗ trợ 4G\nSIM\t2 Nano SIM Có nghe gọi\nCamera sau\nĐộ phân giải\t8MP\nQuay phim\tHD720p@30fps FullHD1080p@30fps\nTính năng\tĐèn Flash\nCamera trước\nĐộ phân giải\t5MP\nTính năng\tQuay video HD Quay video FullHD\nPhụ kiện trong hộp\nPhụ Kiện Trong Hộp\tSạc\nDây cáp sạc\nQue lấy thẻ nhớ\nSách HDSD	5ced1805-e014-4eae-a4fb-af7d1e90ff64	\N	2026-05-21 08:52:22.108	2026-05-21 08:52:22.108	f	\N	t
c8907458-7814-46b1-b9e3-4d606b831b5c	Bàn ăn mặt đá nhập khẩu sang trọng AB070	ban-an-mat-da-nhap-khau-sang-trong-ab070-4634bm	Kích thước :\n160 x 90 x 75 (cm) 180 x 90 x 75 (cm)\nTình trạng :Còn hàng\nBảo hành :12 tháng\nXuất xứ :Nhập Khẩu\nChất liệu :Mặt đá Ceramic, chân inox	e5fd2be3-07f8-40ad-a081-7a3b220c3552	\N	2026-05-21 08:54:08.354	2026-05-21 08:54:08.354	f	\N	t
569d040a-b54c-4594-a865-0b5aa214a8e2	Set bộ quần áo nữ cao cấp Phong cách hàn quốc thời trang	set-bo-quan-ao-nu-cao-cap-phong-cach-han-quoc-thoi-trang-w6q1ww	Phân loại màu: Đen / Xanh\nChất liệu: Polyeste cao cấp\nKiểu dáng: Sét bộ thời trang giản dị khí chất cao cấp mới, phong cách nước ngoài, giảm tuổi, giảm béo , thiết kế đẹp mắt, thanh lịch mặc đi chơi đi làm đều phù hợp\nĐảm bảo chất lượng, form dáng thiết kế hợp thời trang	c1469243-f1d4-42e6-90da-1664a015cdfc	\N	2026-05-21 08:56:13.194	2026-05-21 08:56:13.194	f	\N	t
933cd7d8-45bc-41fd-9811-705e75819a33	Máy ảnh Canon EOS R50 (Kit RF-S18-45mm F4.5-6.3 IS STM Đen)	may-anh-canon-eos-r50-kit-rf-s18-45mm-f45-63-is-stm-den-i7dwnx	Giá bán\t19,900,000 VNĐTiết kiệm 10%\nGiá khuyến mãi\t17,900,000 VNĐ (Đã có VAT)\nThương hiệu\tCanon\nBảo hành\t24 tháng\nXuất xứ\tĐài Loan	e7ebe5ce-d6b7-491e-89c8-61fbcfa5a93e	\N	2026-05-21 09:15:38.678	2026-05-21 09:15:38.678	f	\N	t
680a8690-635c-4b55-8379-77d6b41f001a	Máy ảnh Fujifilm Instax Mini Evo Đen	may-anh-fujifilm-instax-mini-evo-den-eyuucu	Giá bán\t5,900,000 VNĐTiết kiệm 5%\nGiá khuyến mãi\t5,590,000 VNĐ (Đã có VAT)\nThương hiệu\tFujifilm\nBảo hành\t12 tháng	e7ebe5ce-d6b7-491e-89c8-61fbcfa5a93e	\N	2026-05-21 09:18:18.614	2026-05-21 09:18:18.614	f	\N	t
e224a495-cc12-4069-a901-236170864bed	Tai nghe Logitech G321 LightSpeed White	tai-nghe-logitech-g321-lightspeed-white-etj2o3	Tai nghe Logitech G321 LightSpeed White\nTai nghe chơi game không dây, hỗ trợ kết nối 2.4 GHz LIGHTSPEED và Bluetooth 5.2\nTrọng lượng nhẹ: ~210 g\nDriver: 40 mm, dải tần đáp ứng: 20 Hz – 20 kHz	323b8bb1-af0d-455f-ad7a-44a513de56a5	\N	2026-05-21 09:19:44.767	2026-05-21 09:20:30.341	f	\N	t
9c71218d-e2b2-45b4-82c4-6bc409deab30	Bộ bàn ăn tròn 6 ghế Monet sang trọng HAC-035	bo-ban-an-tron-6-ghe-monet-sang-trong-hac-035-ra4xfv	Kích thước :\nBàn KT 80 - 150 + 6 ghế\nTình trạng :Còn hàng\nBảo hành :6 tháng\nXuất xứ :Nhập Khẩu\nChất liệu :Mặt đá Ceramic, chân inox ; Ghế da PU	df278796-7010-4462-adea-f59b64b12423	\N	2026-05-21 11:39:53.421	2026-05-21 11:39:53.421	f	\N	t
9251db4c-b9bf-474d-bf4a-b8b2971f1067	Tai nghe không dây Xiaomi Buds 5 Pro Wifi	tai-nghe-khong-day-xiaomi-buds-5-pro-wifi-19u19a	Kích thước\t\nTai nghe: 25.78 × 31.39 × 21.24 mm\nHộp sạc: 60.5 × 48.45 × 26.79 mm\nTrọng lượng\t\nTai nghe: 5.6g (±0.1g)\nHộp sạc: 41.8g (±0.5g)\n\nCông nghệ âm thanh\t\nHi-Res Audio\nQualcomm® aptX™ Lossless\nHarman AudioEFX\nMicro\t\n3 micro\nThời lượng sử dụng Pin\t\nTai nghe: 8 giờ\nHộp sạc: 40 giờ\n\nPhương thức điều khiển\t\nCảm ứng chạm\nTính năng khác\t\nĐiều khiển cử chỉ AI để phiên âm và dịch thuật\nChống bụi & nước IP54\nHãng sản xuất\t\nXiaomi	323b8bb1-af0d-455f-ad7a-44a513de56a5	\N	2026-05-21 12:08:46.763	2026-05-21 12:08:46.763	f	\N	t
9b080ce0-dff0-4166-adfa-34e9eed7339a	OPPO FIND X8 (16GB+512GB)	electronic-wooden-cheese-2ko-6I4DV-	Kích thước màn hình: 6.59 inch\nCông nghệ màn hình: AMOLED\nRAM: 16 GB; ROM: 512 GB\nHệ điều hành: Android 15\nChip xử lý (CPU): MediaTek Dimensity 9400 8 nhân	b7079621-c838-4e4a-a725-7750e2e31c5e	[-0.36201355,0.18562081,-0.3945552,-0.21233493,-0.94528097,-0.41180393,-0.7389618,0.87342155,0.58189106,-0.6816232,-0.32875472,-0.7033197,-0.71961135,0.07081474,-0.057288688,-0.12655601,0.4069232,-0.53057766,-0.021429071,-0.40325737,-0.55901694,-0.015874615,-0.6636237,0.15459675,-0.7522839,0.928594,0.25877172,-0.5754119,0.67703825,-0.33593827,0.5365198,0.38520196,-0.835575,0.55441296,-0.9154857,-0.041606493,0.75579464,-0.2879997,0.9806157,-0.31117415,-0.39842418,-0.84477067,-0.23052353,0.6410002,-0.07439976,0.6437243,0.63556993,-0.9919162,-0.9517177,0.85796523,-0.78082085,0.7723639,0.5278049,-0.55300593,0.734448,-0.902338,-0.14589149,-0.87742937,0.9339019,0.7636261,-0.059763327,0.20992017,0.5841901,0.9199578,0.3532051,-0.34043956,-0.68588835,0.8443154,0.7919701,-0.97474074,-0.18921053,-0.68932885,0.5227572,-0.7001725,0.27605468,-0.15609051,0.77809864,0.28965524,-0.045081083,0.6396692,-0.06613639,0.72526014,-0.37461615,0.50534636,0.097510606,0.9609708,0.074971676,0.98190033,0.22636484,0.09134457,-0.8215816,0.23830843,0.45072752,-0.7831332,0.7089344,-0.6493368,-0.105584495,0.41997907,0.3580607,0.52840585,-0.5282363,-0.66360646,0.41259375,0.50607926,-0.38610214,-0.9583496,-0.5812746,-0.6721885,-0.2428962,-0.17256042,0.87559843,-0.707521,0.21623404,-0.5160264,0.111992635,0.8344782,0.8240608,-0.76563,0.07344806,0.8337008,0.04517553,-0.64449924,-0.88398415,-0.49102393,0.9963965,-0.5372759,0.15367153,0.79488,-0.046578396,-0.39911488,0.4880861,-0.73908144,0.38744286,0.24744894,-0.42893568,-0.68086505,0.883417,0.8504732,0.15741958,0.13034008,0.3939852,0.5305526,-0.23698233,0.18907195,-0.68571454,0.49363565,0.4068325,-0.55818266,0.6935778,-0.5550025,0.4964846,0.7658969,0.051972117,-0.3621301,-0.09532627,0.90198725,0.7534121,0.35245484,-0.8996176,0.34034705,0.35314822,0.030079251,0.9987492,0.535109,-0.079803154,-0.121543705,0.23004451,0.608203,0.64325535,0.17414512,-0.91052455,-0.8468207,0.5126247,-0.34426177,-0.8214668,-0.12552734,0.1332538,0.17638694,0.042941216,-0.57621115,-0.81969243,-0.03649131,0.1417408,0.8464432,0.07467937,-0.24487877,-0.135414,0.33114806,0.23023662,0.08414382,0.438117,0.47535133,0.9816508,-0.5507921,0.9536324,0.1385959,0.62981695,0.064520545,-0.7200047,-0.44787267,0.22336936,-0.18404253,0.9011779,-0.8580624,0.043903206,-0.5197633,-0.7959288,0.2748922,0.5713128,0.1878848,-0.71141136,0.304333,0.6700583,0.43084306,-0.74534076,-0.2589684,-0.32890007,0.5116944,-0.43298152,0.20270015,0.6129744,0.2707107,0.6009819,0.5831198,0.44870704,0.0306506,0.3527471,0.4602348,0.07965174,0.587271,0.08943362,-0.95359486,-0.09651041,0.30893227,-0.37285125,0.38875538,0.22328365,0.72198033,-0.8928816,-0.86923605,0.79142714,-0.3578156,0.8783489,-0.18127565,-0.4849954,0.87126845,-0.6847111,-0.47864234,0.3182959,-0.68510157,0.66579515,-0.86351895,0.13361771,-0.690867,-0.5336079,-0.77963066,0.24862617,-0.23279455,0.9543309,-0.33596855,0.03242473,0.39134774,-0.070022285,-0.81634504,-0.90310895,-0.4488813,-0.13203165,0.17512625,0.41490322,0.4412178,0.2705926,0.95838404,0.29117012,-0.050442897,0.5428071,-0.88362104,0.35439977,-0.3771527,0.9961617,-0.97396904,-0.32636175,-0.9165308,-0.61648405,-0.75531954,-0.053857245,-0.50947493,0.5182401,-0.32151422,0.5527728,0.856285,0.616112,0.7854573,-0.67770433,-0.17243108,-0.30536386,0.41581023,-0.8668914,-0.7012116,0.40573394,-0.106318735,0.7466686,-0.510811,0.23945105,0.7069663,0.34399983,-0.47105783,0.30466515,-0.18513618,-0.4356588,0.08068339,0.75929815,0.13397503,-0.3368928,-0.009493654,0.74317217,0.42237166,-0.1614356,-0.93107563,-0.8691846,-0.9864773,0.08039727,-0.82384264,0.02493003,-0.8725456,-0.30075866,-0.35901377,0.18864001,0.7160907,0.7334596,-0.38355082,-0.36292177,-0.16841091,0.38355434,-0.84355503,0.083668515,-0.67320114,0.9946316,-0.035249073,0.2997947,-0.9521287,-0.29147696,0.94746727,-0.09479718,-0.518261,-0.6822909,-0.11808195,0.8388757,-0.29767305,-0.09225922,0.95896333,-0.59434015,0.96111804,-0.30089197,0.8981214,0.57911646,0.18190281,0.96324414,-0.54681987,0.16706784,-0.22059779,-0.6442695,-0.712253,-0.68922085,-0.15232028,0.85283583,0.98582995,0.5882873,0.3402051,-0.3496725,-0.9650471,0.17355579,0.009426135,0.6537792,-0.7787692,-0.16418299,-0.16228577,0.71001405,-0.43528128,-0.79164994,-0.55135524,0.71034527,0.7151466,0.15173414,-0.7090236,-0.92091995,0.03561775,0.68301255,0.43540284,-0.7460014,-0.5280345,0.025925547,-0.9768136,-0.17339922,-0.15599918,0.88400126,-0.1982181,-0.30449468,-0.22392145,0.4287871,-0.15457326,0.4334465,0.24218708,0.39966074,-0.0677034,0.44797885,0.7492564,-0.35165733,0.26195982,-0.23809396,0.5861747,-0.631847,-0.7963078,-0.24819343,-0.5676815,0.12130662,0.9898508,0.40248293,-0.44929075,-0.92749095,-0.12882015,-0.33310097,-0.06170767,-0.8472411,-0.12420986,0.8359262,0.91226065,0.95369506,-0.8903332,-0.2697986,0.98827094,-0.8593965,-0.21171938,0.69290537,0.6067711,-0.77723145,0.4459034,-0.97520024,-0.24504426,-0.9479991,0.7184679,0.6639149,0.3864264,0.9182638,0.41464424,-0.5474099,-0.25689033,-0.29715338,0.9295121,-0.8518773,0.8848131,-0.85385036,-0.07652078,0.028104521,-0.174965,-0.10411129,-0.4123458,-0.26896182,-0.81079173,0.122889705,0.7684356,-0.5123977,-0.8805581,-0.6054299,0.8055598,-0.6964824,-0.6605294,-0.49614328,0.012603025,0.7193873,-0.7631039,0.50833416,0.5012858,0.10456337,0.49981952,0.061312605,0.45986474,-0.875467,-0.29742435,-0.6824306,-0.68787974,0.54569143,0.45334992,-0.76016414,-0.99701387,-0.96630406,0.29393068,-0.42224625,-0.7109929,0.035242774,-0.18824106,0.8498721,0.6606484,0.8825545,0.7532088,-0.010194914,0.19310427,0.30251604,0.49675953,-0.787029,0.3375771,-0.006918714,0.3376695,-0.759476,0.85275775,0.73147994,0.463076,-0.93476737,-0.009050893,0.10483026,-0.50844127,0.060687374,0.9199378,0.37506407,0.4156072,0.85664344,0.8274855,-0.82179236,-0.19025382,-0.61114734,-0.60974944,-0.80556154,0.73616624,0.93378264,0.59689975,-0.743531,-0.84869576,0.029625818,0.02291395,-0.024550082,-0.9395819,0.8438064,-0.44588885,-0.014704506,-0.63801503,0.44543597,-0.3050161,0.37462598,0.7377053,0.6237697,0.51339215,0.28320447,-0.12207792,0.44157705,0.8320835,0.7559485,0.36048666,-0.4099226,0.037319034,0.37394628,0.34219992,-0.035331845,-0.02377351,0.65503496,-0.5842241,0.27829105,-0.16923046,0.9283617,0.08347466,-0.6510951,0.9282518,0.53207326,-0.3311402,-0.65772206,-0.7867824,-0.061409168,0.6535904,0.93036205,-0.96262497,-0.1499165,-0.13795161,0.14498009,0.21496329,0.37207523,0.1696085,-0.7226313,-0.451198,0.35200328,-0.32146198,-0.2583135,-0.5565948,-0.62672204,0.29445714,-0.046009555,0.765739,-0.9127976,0.41287836,-0.2844396,-0.8722899,0.057995986,0.5028644,0.4099965,-0.64187545,-0.1213763,-0.9229662,-0.20169684,0.4947388,0.04850468,0.017057355,-0.8975148,-0.45733362,0.66718495,-0.41530636,0.11830808,-0.8575502,0.64530784,-0.33657822,-0.27244166,-0.80442405,0.45828295,0.60514796,-0.516442,0.5180865,0.056841724,-0.7266258,0.89075905,0.5930662,-0.8129901,-2.1543377e-05,-0.44792268,-0.20254675,0.44706813,-0.5321913,-0.96179926,0.34480444,-0.9385901,-0.16321212,0.31228274,0.1668733,-0.8572549,0.23777893,0.24895145,0.7302355,-0.19072554,-0.44145918,0.09399359,0.43624127,-0.75896114,0.6442615,0.35086793,0.8790633,0.87552613,0.8355744,0.9513266,0.75376797,0.653068,0.7121022,-0.23502482,-0.73409,0.3511462,0.10780716,-0.69033575,0.39462593,-0.39897874,-0.11957608,-0.5551858,-0.5456127,0.26495734,0.44378164,-0.21444237,0.50500107,0.17911677,0.9274406,0.5683486,-0.79898757,0.4245549,-0.38988236,0.94310594,-0.13645938,0.23191597,0.13432822,0.5190794,0.8896131,0.81113404,0.9219768,0.9790063,0.43343037,-0.7484144,-0.7870134,-0.66257715,0.2559692,-0.49478537,0.08547769,-0.97188026,-0.5945597,-0.89140886,0.39562452,0.28012517,0.92544246,-0.049100596,-0.6034952,-0.5921384,-0.28751245,-0.6954612,-0.56571215,0.26610845,-0.24713995,-0.045797653,-0.28492254,-0.54791665,-0.27355427,0.99050796,-0.97172314,0.41660973,0.30007365,0.56787723,0.19071387,0.7902221,0.19590089,0.6464209,0.032762244,-0.18238872,-0.6715334,-0.46413732,0.75901973,-0.03737405,-0.7225321,0.33440828,-0.35568216,-0.88686323,-0.40861604,-0.8950097,0.7604117,0.31323987,0.083693445,0.98518366,0.52515525,-0.7584953,-0.4485949,-0.40237114,-0.35044065,-0.6502289,-0.9971727,0.6721289,-0.92483,0.08699163,-0.95478046,0.48724347,0.43737555,-0.10096849,-0.55492854,0.8949649,0.0857299,0.49899715,-0.56258774,-0.14506653,-0.96710104,-0.13584185,-0.6707863,0.5317279,0.18197167,0.4681072,-0.68723416,0.95828044,0.19654568,0.25247067,0.47462904,-0.829015,0.081335336,0.22486067,0.048898354,-0.45756593,-0.51128936,0.6744303,-0.41443667,0.9842576,0.21459274,-0.67076063,0.4115021]	2026-05-20 07:06:07.473	2026-05-21 08:21:06.433	f	\N	t
2eca6f19-46e9-4d2c-9fe5-af77803038d9	Samsung Galaxy A57 5G	bespoke-rubber-chips-nsv-hNo5Nb	Innovative Fish featuring potable technology and Ceramic construction	b7079621-c838-4e4a-a725-7750e2e31c5e	[-0.0673632,-0.03934971,-0.40815347,-0.3128914,-0.39184156,0.6933593,0.73675114,0.39676613,-0.8976666,0.029482659,-0.6604367,0.15554434,-0.96242386,-0.18722582,0.85237944,-0.3874684,0.6439525,-0.7988366,-0.2833403,0.12900205,-0.9828258,0.8638178,0.40043387,0.53513086,0.04308032,-0.7292789,0.12360243,-0.74298203,-0.16374093,0.06880587,-0.8985641,-0.00830317,-0.38414282,-0.44635713,-0.56587833,-0.41430897,0.0030653449,0.46467555,-0.97378224,-0.2884455,0.6697427,-0.3385668,0.58295137,0.81272686,0.63519955,0.8384127,0.09268944,0.46128222,-0.15361205,-0.17673641,0.87029195,-0.40540296,0.18731241,0.1832958,-0.2850422,-0.93654424,0.3801498,-0.6350051,-0.5115805,-0.7775762,-0.14179485,-0.5455014,0.14194855,0.31831074,-0.20478907,-0.2635046,0.12921874,-0.82157,0.37489584,-0.391371,-0.05300555,-0.8041925,0.83938706,0.78509784,0.35194317,0.4880607,0.52118844,0.273653,0.9798099,0.57367,-0.58565044,0.8576708,0.44954905,-0.8458113,-0.057008307,-0.7194895,0.9220869,-0.0065043764,-0.92809355,0.12718555,0.56798154,0.8985407,-0.028634958,-0.4286452,-0.10450738,-0.8014824,0.34026903,0.25940827,0.4884333,-0.11342062,-0.6299436,-0.89239854,0.05513254,-0.025907526,0.2931145,0.08437665,0.26668274,0.953227,-0.7004758,0.62908506,-0.067221284,-0.13537292,0.051192433,0.06649479,0.6047029,0.28945395,0.22000931,-0.74284554,0.45673943,-0.08744933,-0.28084025,0.6247699,-0.14677024,-0.6693636,0.1649756,-0.6883656,0.10647864,-0.7349565,0.9843202,0.20726973,0.44743344,0.061126385,-0.5756438,-0.50671494,-0.14606062,0.63637507,-0.91074544,-0.91569906,-0.917994,0.18537344,0.62279207,0.74893844,-0.0102256695,-0.27665496,0.2264511,-0.06875879,0.8601711,-0.43393496,0.43441346,-0.9841664,-0.588451,-0.6743653,0.21916401,0.10866504,0.8498328,0.7306246,-0.7157662,-0.09329592,0.8194048,-0.71631986,0.2110029,0.62231123,0.68799603,-0.20607103,0.72593653,0.6997336,-0.014502888,-0.49347666,-0.59550166,0.97295916,-0.152572,0.57713753,-0.10548166,0.6900188,-0.43238643,-0.28168398,0.98116446,-0.5642141,-0.6288614,-0.5935604,0.2842037,0.7959362,0.8271913,-0.007143867,0.41806915,0.3475233,-0.50719684,-0.48267654,-0.6065461,0.5617022,-0.7394097,0.9451741,0.41966543,0.25681016,-0.043880597,-0.25775874,0.5196333,0.34399253,0.8706261,-0.5376657,0.96093875,-0.6639941,0.52614236,0.8694203,0.6541445,-0.13836233,-0.08605581,-0.15938224,0.7638588,0.4338835,0.57057726,0.28860995,-0.8702351,-0.7340206,-0.042780332,0.6992079,0.0068674413,-0.74158823,0.6081215,0.81711745,0.67014074,-0.43729603,0.4841974,-0.46435338,0.32375893,0.08452854,-0.3148414,0.948937,-0.27974987,-0.7739609,-0.27611157,-0.36599395,-0.26874343,0.28191152,0.16646563,-0.10687202,0.54567844,-0.033842374,0.66177714,0.26478624,-0.1846573,0.42177165,0.69407153,-0.9460951,-0.44243655,-0.68176425,0.57568115,-0.43617305,-0.85233915,-0.8711242,-0.6521582,-0.15697806,-0.96533316,-0.38254043,-0.22542615,-0.9586952,0.3555929,0.8632665,-0.6299461,-0.7830232,0.10003131,0.5856765,-0.39587092,0.94327223,-0.83253103,0.31663877,-0.56365955,0.5534232,-0.9715612,0.16950591,0.47101215,-0.4667286,-0.46106678,0.2960216,-0.72550064,0.24407843,0.3520656,0.99403375,-0.2939775,0.36406684,-0.9214654,0.70690906,-0.04017957,-0.37677768,-0.8490259,0.74567235,0.3740221,0.97675884,0.035009824,0.27265546,0.3984553,0.9059093,0.2065179,0.9975306,0.18038724,0.9447712,-0.6769189,-0.34228647,-0.0057678204,-0.9162831,0.7870141,0.664676,-0.7164352,0.14321002,-0.8487578,0.64759666,-0.5511539,0.84465194,0.8342052,-0.1283933,0.2941132,0.7146754,0.050152533,-0.45937487,0.88747174,-0.39677334,0.1886225,-0.31443012,0.98628265,-0.8967576,0.5549529,0.7166631,-0.9757967,0.0246776,0.10463525,0.8612342,-0.69602007,-0.98816544,-0.10062543,-0.3191106,-0.62067294,-0.9482986,-0.7706384,-0.1512896,-0.7833601,0.2043712,-0.08443404,-0.22840653,0.14640272,0.61622363,-0.65771925,-0.34247142,-0.90243375,-0.5589098,-0.5583458,0.60795134,0.9133034,-0.33330718,-0.85805637,0.78908175,0.65566,-0.94852966,0.15430099,0.67591316,0.923665,-0.15137355,0.94946086,-0.6237553,0.8484314,-0.64529514,-0.095171526,-0.37559482,-0.6625254,0.64972395,-0.7177506,-0.5113657,0.18715729,0.69313157,0.22851749,-0.016130634,-0.48821387,0.8592045,0.37652472,0.86603683,0.097407535,-0.54972786,0.30069807,0.72600824,-0.57737035,0.40253744,-0.6518536,-0.24796486,0.045758277,-0.21280752,0.76962376,0.21806338,-0.8644041,0.80624497,0.25163636,0.4831183,0.9463587,-0.609619,-0.31507096,-0.15663455,0.9054536,-0.09869864,0.35579827,0.77532107,-0.4929042,-0.21102887,-0.04747239,0.98855805,-0.09800983,-0.24160315,0.056798358,-0.83758307,0.03071405,0.66163117,0.68282974,-0.97030854,-0.76772887,-0.6345038,-0.091895275,0.84584755,-0.31986624,0.5210668,0.5028506,0.4754972,-0.21156141,0.43699536,-0.9298282,-0.39364052,-0.14854045,0.5166521,0.9427529,-0.5662973,0.63732386,0.5590134,0.025741955,-0.5931488,-0.5421132,0.8822367,-0.48977864,0.84445935,0.40227178,0.09410258,-0.17705958,-0.50684005,0.4383175,0.21571758,-0.9945001,-0.33401138,-0.4850876,0.6407153,0.66480833,-0.8793707,-0.005869148,-0.021191051,-0.05245221,-0.76912665,0.1658213,-0.5603269,-0.42422226,0.16091725,-0.5816567,-0.3177352,-0.09053037,-0.3945984,-0.67242885,-0.86153924,0.49210203,-0.71217,-0.4617503,-0.32309335,0.78359985,-0.42233443,-0.87982756,-0.9861228,0.026678456,0.57165724,-0.4035957,0.76202,-0.5197593,-0.16294058,-0.006342849,0.87997794,-0.4651125,0.027195744,0.1953226,0.9267187,0.5295276,0.015885286,-0.6144568,0.6912526,0.325661,0.18805431,0.1721882,0.20691265,0.22787537,0.26624957,0.12245624,0.35699475,0.039555706,0.05212967,-0.9902737,0.8582243,0.6176382,0.18057005,-0.487102,0.7994507,0.7969547,-0.79067683,-0.3962627,0.88205355,0.5721437,-0.014738493,-0.31482676,0.19532458,0.86408454,-0.086803675,-0.38368863,0.44564292,-0.44170433,0.50787765,-0.1510935,0.78858525,0.46476012,-0.9894585,0.86126286,-0.95798755,0.93323135,0.39422756,-0.012356942,-0.726913,0.43600366,-0.45117977,0.52353436,0.3588772,-0.85518706,-0.76758486,0.2811443,0.20836309,-0.87710136,-0.7324174,-0.33866632,-0.18130371,-0.3941084,-0.65261173,-0.6888861,-0.55687445,-0.736613,-0.23737037,-0.99165267,0.04205129,-0.6075335,-0.95387775,-0.7651519,-0.6148388,-0.1512639,-0.037034474,0.9225645,-0.7838758,-0.7208865,-0.33778396,0.41455644,-0.23846447,0.3162278,-0.52028847,0.9098679,0.51596594,-0.7429261,-0.8465378,0.36399046,0.6223682,-0.28302354,-0.6315666,-0.29499504,0.2036979,0.4331566,-0.58342695,-0.9085702,-0.887386,-0.5791194,-0.43216717,-0.96623045,0.018859372,-0.6322208,0.6242608,0.7029198,0.52480644,-0.16705598,0.72353566,-0.8943108,-0.7092724,-0.61810064,-0.7903476,-0.2413532,-0.9941255,-0.20986295,-0.13011096,0.7830193,-0.4321702,-0.5943054,0.68772715,0.92526746,0.69800425,-0.5631168,0.22988687,0.65403426,0.35408494,-0.4192757,0.20629227,0.79971296,0.0054161516,-0.5393018,0.974243,-0.85236555,-0.48856434,-0.22345276,0.031272806,0.13718353,0.5640747,-0.821897,0.35201204,-0.2108827,-0.75777084,0.6955554,0.049906313,-0.80209535,0.4712353,0.99644476,-0.11231609,-0.31070688,0.359542,-0.073627114,0.23897177,-0.8645859,-0.80216897,0.25497594,0.38299394,0.05483093,0.29610196,0.4004208,0.39377132,-0.16153683,0.6245053,-0.33077645,-0.65106994,-0.8817748,-0.4613891,0.48598576,-0.24073252,0.6087749,0.8163071,0.07151668,-0.8794974,0.95376575,-0.1483346,0.38533834,0.99828035,0.7415794,0.9374489,-0.7062321,-0.41196474,0.028409464,-0.3030196,0.6314726,0.3133593,0.7488906,-0.9817029,-0.4517139,-0.05904645,0.1398832,-0.48576626,-0.6121135,-0.9360877,0.6819167,-0.19528395,0.9747041,-0.6994937,0.65605474,-0.51298934,-0.23572575,0.4651682,-0.84197384,-0.8908065,0.93114376,-0.5503445,0.71651006,-0.087612726,0.37256312,-0.9510892,0.76851135,-0.5620211,-0.45445094,-0.7304866,0.4780278,-0.69520646,-0.3410371,0.5952036,0.22972298,-0.5246111,0.5682813,-0.66050655,-0.9049592,0.4479119,0.5851816,0.8085009,-0.03466574,0.25110632,0.38222846,-0.07115974,-0.8486963,-0.5121001,0.72041035,-0.8410995,0.29172835,-0.37370756,0.496265,-0.5035232,-0.8856939,0.79045147,0.75468516,-0.70951,-0.036712706,0.39029905,-0.15353212,-0.34791505,-0.8294868,0.5398613,-0.7007065,-0.16891013,-0.49430943,-0.8662078,-0.7018825,-0.2503194,0.355118,0.7284041,-0.58882993,-0.29270846,0.6459629,-0.22426464,0.34677914,-0.35381183,-0.52249175,0.45091745,0.04824305,0.40134466,-0.07733482,-0.9758156,0.42467874,0.14725903,-0.55835557,0.001118938,0.91649157,0.76946557,0.88741374,0.6514084,0.8310897,-0.034414943,-0.36413366,0.80606216,0.39978242,-0.11640831,-0.36969146,-0.6666243,-0.46435136,0.039253455,-0.70697355,-0.5968131,0.91300845,-0.602412,-0.46766388,-0.67813414,-0.6238443,0.2589442,-0.904934,0.46093535]	2026-05-20 07:06:07.723	2026-05-21 08:19:45.564	f	\N	t
a4f7fd8a-a14b-4030-8136-457956dcf3d2	Bàn ăn Luxury mặt đá nhập khẩu AB074	ban-an-luxury-mat-da-nhap-khau-ab074-66eijv	Kích thước :\n140 x 80 x 75 (cm) 160 x 90 x 75 (cm) 180 x 90 x 75 (cm)\nTình trạng :Còn hàng\nBảo hành :12 tháng\nXuất xứ :Nhập Khẩu\nChất liệu :Mặt đá Ceramic, chân inox + gỗ	e5fd2be3-07f8-40ad-a081-7a3b220c3552	\N	2026-05-21 08:53:21.225	2026-05-21 08:53:21.225	f	\N	t
f994ac8a-37e1-4273-81fb-74e4e7958dc2	Bàn ăn cao cấp mặt đá nhập khẩu AB062	ban-an-cao-cap-mat-da-nhap-khau-ab062-n9zzt8	Kích thước :\n140 x 80 x 75 (cm) 160 x 90 x 75 (cm) 180 x 90 x 75 (cm)\nTình trạng :Còn hàng\nBảo hành :12 tháng\nXuất xứ :Nhập Khẩu\nChất liệu :Mặt đá Ceramic, chân inox	e5fd2be3-07f8-40ad-a081-7a3b220c3552	\N	2026-05-21 08:54:49.394	2026-05-21 08:54:49.394	f	\N	t
da23d738-724a-47d6-8721-c8b93653eb88	Sony Alpha A6700 Body + Sony E PZ 16-50mm F3.5-5.6 OSS II	sony-alpha-a6700-body-sony-e-pz-16-50mm-f35-56-oss-ii-kqwfwh	Giá bán\t39,900,000 VNĐTiết kiệm 11%\nGiá khuyến mãi\t35,490,000 VNĐ (Đã có VAT)\nThương hiệu\tSony\nBảo hành\t24 tháng\nXuất xứ\tThái Lan	e7ebe5ce-d6b7-491e-89c8-61fbcfa5a93e	\N	2026-05-21 09:16:56.317	2026-05-21 09:16:56.317	f	\N	t
fee8606c-eacb-427f-8807-5f6213f88afd	Đầm váy voan cổ bẻ sang trọng phong cách hàn quốc	dam-vay-voan-co-be-sang-trong-phong-cach-han-quoc-cxls2t	Với sự chú trọng vào chi tiết và chất liệu, chiếc đầm thể hiện phong cách riêng của bạn. Giúp phái nữ tỏa sáng với vẻ ngoài quyến rũ và đẳng cấp.\nSản xuất: nhập khẩu\nĐược kiểm tra hàng trước thanh toán\nMiễn phí giao hàng tận nơi toàn quốc	c1469243-f1d4-42e6-90da-1664a015cdfc	\N	2026-05-21 11:44:45.197	2026-05-21 11:44:45.197	f	\N	t
50c35079-75e4-4e64-9531-752c1e41705f	Giường ngủ Da Bò ZDG185	giuong-ngu-da-bo-zdg185-bznfil	Trọn bộ\tGồm: giường 1,8 x 2m\n Chất liệu\tGiường da bò tiếp xúc nhập khẩu, Khung Gỗ thông Nga nhập khẩu\n Xuất xứ\tNhập Khẩu\n Bảo hành\tBảo hành điện tử 5 năm ( khung sườn ) tại www.zsofa.vn/baohanh/	df278796-7010-4462-adea-f59b64b12423	\N	2026-05-21 11:48:48.729	2026-05-21 11:48:48.729	f	\N	t
da43852a-66b7-4c5d-a92b-812c6b985327	HyperX Cloud III	hyperx-cloud-iii-jm9bze	Sự thoải mái và độ bền đặc trưng của HyperX\nDriver nghiêng 53mm, tinh chỉnh cho chất âm chuẩn xác tuyệt đối\nMicro 10mm khử ồn với chất giọng rõ ràng và đèn báo tắt mic LED\nTương thích đa nền tảng qua cổng 3.5mm, USB-C và USB-A\nTương thích với: PC, PS5, PS4, Xbox Series X|S, Xbox One, Nintendo Switch, Mac và thiết bị di động.\nLoại tai nghe\nOver-ear\n\nKết nối\nUSB (sound card đi kèm)\n\nMicrophone\nCó thể tháo rời\n\nDạng driver\n53mm đặt nghiêng\n\nThương hiệu\nHyperX	323b8bb1-af0d-455f-ad7a-44a513de56a5	\N	2026-05-21 12:10:17.849	2026-05-21 12:10:17.849	f	\N	t
db4dc78a-a17c-4b70-9e3e-0d48594194e6	Roborock F25 Ultra gập nghiêng 180°	roborock-f25-ultra-gap-nghieng-180-fuc0cn	Lực hút: 22.000 Pa\nPhạm vi chuyển động: Thiết kế FlatReach 180°\nNhiệt độ tự giặt: 150°C\nNhiệt độ sấy: 90°C\nThời gian sấy: 5 – 30 phút\nBánh xe thích ứng SlideTech: Có\nPhát hiện bụi bẩn: Có\nTự động pha nước lau sàn: Có\nĐiều khiển qua app: Có\nHiển thị màn hình LED & cảnh báo giọng nói: Có\nKích thước bình chứa nước sạch: 1000ml\nKích thước bình chứa nước bẩn: 720ml (nằm phẳng: 600ml)\nThời gian hoạt động: 45-60 phút (Tự động); 20 phút (Hơi nước); 15 phút (Nước nóng)\nThời gian sạc: 4 giờ\nDung lượng Pin: 4600 mAh\nTổng công suất: 240W\nKhối lượng máy: 5.6kg	fd492d86-0039-4caa-9520-ae6b47f42b0c	\N	2026-05-21 12:11:51.567	2026-05-21 12:11:51.567	f	\N	t
6a1989ce-70c3-475e-94c3-c276d7853dc3	OPPO A6 Pro 8GB 128GB	soft-plastic-ball-tl3-3T4tS9	Đặc điểm nổi bật của OPPO A6 Pro 8GB 128GB:\nThiết kế mỏng nhẹ, thời thượng và sang trọng\nKháng nước và bụi IP69, đạt tiêu chuẩn độ bền quân đội\nMàn hình AMOLED 6.57 inch rõ nét, tần số quét 120Hz mượt mà\nCamera chính 50MP tích hợp AI, hỗ trợ chụp đêm và chụp dưới nước\nTrang bị vi xử lý MediaTek Helio G100 cho hiệu năng ổn định\nPin dung lượng lớn 7000mAh, hỗ trợ sạc nhanh SUPERVOOC 80W	b7079621-c838-4e4a-a725-7750e2e31c5e	[0.8132121,-0.123366356,0.8266841,-0.16249801,-0.9937688,-0.09109518,-0.1618447,0.10932316,0.48057804,0.60323405,-0.4103858,0.9842924,0.61908257,-0.05102246,0.7056788,-0.75131804,0.48929203,-0.7872141,0.42610362,-0.04506854,-0.17784199,0.5250637,-0.8481048,0.58313274,-0.4725798,-0.6081045,-0.10699296,0.8360962,0.6240099,-0.9944472,-0.011945321,0.9340452,-0.8448347,0.4629434,-0.7499074,0.77323854,0.55245996,0.89028615,-0.40666378,-0.7107214,-0.6633362,0.64060324,-0.46992427,0.7835213,0.020545041,0.84430206,0.5287599,-0.18636936,-0.8634861,-0.05920124,-0.15791225,0.64741033,0.124485545,0.43643257,0.6338351,-0.8818606,0.16278894,-0.14063098,-0.1685525,-0.7953546,0.08701848,0.348445,-0.54522747,0.8981724,-0.8331879,0.18949735,-0.6711157,-0.81536204,-0.5724478,-0.40508595,-0.57249516,-0.48708957,-0.9230207,0.54235566,-0.4165448,0.4760757,0.5389591,0.8361734,0.6286149,-0.7056167,-0.6198314,0.35377234,-0.28955585,0.45425326,-0.9503548,0.72866905,0.08082946,-0.8567192,-0.7485052,0.57701325,0.9977615,0.56167626,0.14561407,-0.87987155,0.10008027,-0.3008938,-0.11709794,-0.6575923,0.23153228,-0.16875175,0.8159716,-0.47288042,0.2117589,0.24849421,-0.86677766,-0.3093572,0.41058207,-0.38719234,-0.76553226,-0.23472805,0.9748477,-0.5703729,0.5071566,-0.9622967,0.39086592,-0.09901076,0.30177984,-0.22395189,-0.53419995,-0.81087035,0.45072046,0.20670897,0.63534546,-0.74937046,0.96121836,0.5945542,0.60028803,0.85712606,-0.063700356,-0.0013630635,0.71368355,0.26157284,-0.28149506,0.1147927,-0.35091937,-0.2858528,-0.069800735,0.45287266,-0.6722269,0.16208959,0.18694977,0.056235913,0.6263518,-0.78535455,0.25189695,0.109217934,-0.9391927,-0.1264861,0.81295955,0.9138719,-0.022279887,0.6292663,0.8708306,0.28958336,-0.71364844,0.25459436,-0.10328389,0.06699785,-0.38760906,0.900091,0.5940901,0.25940743,-0.08643887,-0.47812232,-0.262324,-0.41675702,0.57164234,0.8573791,-0.64564633,0.33571967,0.95923626,0.07103034,0.8750063,-0.10243391,0.9627458,-0.9559351,-0.96223116,-0.19285527,0.56611603,0.34565067,-0.33993,0.6176267,-0.9331819,-0.24861297,0.824705,0.19255258,-0.97948277,0.003957058,0.61545855,0.7396647,0.70078987,-0.27226055,0.97012985,0.09573655,0.2477927,-0.09120049,-0.53681666,-0.7803268,0.036067877,-0.32887536,-0.74331474,0.5645959,0.5440095,0.21843614,-0.45866773,-0.71796346,-0.88355505,-0.07158366,-0.6971511,0.21532126,0.65509784,0.9592969,-0.88818115,-0.7951801,-0.08236423,0.6435463,-0.27878213,-0.8979131,-0.26516652,-0.7702846,0.7118336,0.41422546,0.39684984,0.5497603,0.9242376,0.36800352,0.50126326,-0.38994786,-0.84283316,-0.20529789,0.8811346,-0.33197814,-0.27550244,0.10403741,0.13788682,0.5021815,-0.28758097,0.2625838,0.92462516,0.04384132,-0.35898778,0.34074962,-0.011897676,0.6722038,0.66413987,0.62525433,0.14206852,0.37609768,0.78121775,0.49899408,-0.17664881,-0.15078384,-0.2800831,-0.84208626,0.23054059,0.7116787,-0.6635877,-0.49854594,-0.84059894,-0.16529697,0.921316,0.93894064,-0.36373916,-0.22914009,0.55871177,-0.080606505,0.03957992,-0.2388259,0.29983193,-0.75563055,0.33064583,-0.32820466,0.69781905,0.36670688,-0.8732511,0.06829291,0.883417,0.8052312,-0.98586416,0.8210294,0.48249826,-0.0707266,0.67857647,-0.7389246,-0.9646089,-0.07661264,0.35576746,-0.18858701,0.034964636,0.91643953,-0.40601677,0.14166598,0.25979078,-0.9252543,0.9547735,-0.9999652,0.015822046,-0.17132165,0.6278668,0.71726906,-0.52135986,-0.08701216,0.86283225,-0.4515529,-0.9914282,0.4158616,-0.81371385,0.21111041,-0.72586066,0.46751475,-0.5542558,0.36503413,0.23061468,0.33321396,0.81859916,-0.98376364,0.17083085,0.94044507,-0.79896575,-0.7876925,-0.011787298,-0.70255035,-0.7736539,0.7887327,-0.5188597,0.22937137,0.6134788,0.1912541,0.59353817,-0.48792025,-0.7766639,0.71742976,0.9649804,0.5449796,0.51578593,-0.008536941,-0.010469733,0.27583924,0.4574214,0.38237324,-0.26784292,-0.49093828,-0.5136394,-0.8419961,0.9490017,0.7459541,0.6703286,0.4851424,0.499356,-0.96728134,-0.84203225,-0.9477067,-0.99924326,-0.49120706,-0.050769515,0.0039047531,-0.8834486,-0.6272004,-0.76235765,-0.8309385,-0.974313,-0.38441458,-0.64532053,0.10903905,-0.3773401,-0.08256204,-0.2258381,-0.95722675,0.20506525,0.36539656,-0.4154719,0.74356705,-0.21798421,0.42725062,-0.7698787,0.93893343,-0.5355318,0.15811165,0.88422924,-0.7730454,-0.68588215,0.81219834,0.43853742,0.5467197,-0.47856182,0.1299329,0.80636555,-0.1376364,-0.20765473,0.077243686,-0.83533955,0.5237003,0.35857713,0.34222978,0.041855697,0.29226983,-0.28849185,0.9170811,-0.26670337,0.31104898,0.5474127,0.3172943,0.36573213,0.028706437,-0.22079818,0.14106451,0.25425324,-0.099946916,0.32438886,0.17069156,0.8971912,0.22881365,0.97427285,-0.23559332,-0.4675682,0.16677801,-0.098404735,0.3948289,0.52712417,-0.021017063,0.068492465,0.22529255,0.5434291,0.5427083,-0.67186874,-0.052070715,0.6932291,-0.6609937,-0.7720518,-0.5257926,-0.78803366,-0.6723292,-0.48429358,0.8077284,0.014275824,-0.38225982,-0.5527725,-0.59815496,0.6505291,-0.7196067,-0.12078512,-0.90496296,0.03297495,-0.2843366,0.9434722,-0.29600072,-0.83482474,-0.2874917,-0.57655704,-0.64733785,0.56516165,0.7656007,-0.40415826,0.16902524,-0.45496807,-0.0926493,-0.87397283,0.26491493,-0.5641757,-0.56511503,0.62061995,0.5275932,-0.776803,0.49157605,-0.4085622,0.3220962,0.13593565,-0.6446824,-0.26782063,-0.68877,-0.8458756,0.3246738,0.38208818,-0.009425543,-0.66338396,0.034887746,-0.32143426,0.6570244,-0.7549821,-0.27297434,-0.5843228,-0.1371131,0.9939074,0.81946814,-0.9716096,-0.62910825,-0.33861887,-0.33669874,0.70079845,0.5265332,0.59054106,0.121725924,-0.08706613,-0.6859425,0.9910092,0.90803534,-0.9396243,-0.07640206,-0.89270794,-0.13787244,-0.284671,-0.45974672,0.47734562,-0.8057003,-0.15829663,-0.0076069715,0.7879565,0.020210052,-0.123782136,0.97102904,-0.0328768,-0.25315186,0.013007557,0.783295,0.75825036,-0.39417762,0.6899191,-0.65180093,-0.881943,0.38029876,0.35893062,0.16680612,0.15108268,0.3987307,-0.34536946,0.15491448,0.35882744,0.6683631,-0.43751568,0.5689605,-0.09877992,0.72244394,-0.9366196,-0.10682877,0.3369474,-0.9931217,0.94193584,0.8052108,0.515727,0.420334,0.45054048,0.51591605,0.68534297,0.9681046,-0.68286896,-0.24285062,-0.016179988,0.67280596,-0.79670864,0.98365504,0.7058216,0.60850835,0.562581,0.8563945,-0.7075486,-0.606241,0.50059885,-0.3327001,-0.5793844,0.9563111,0.7570897,-0.7213318,-0.9647849,0.57300115,-0.07237894,-0.7676986,-0.5209574,-0.84518784,-0.20168297,-0.65283984,0.70688546,0.005514732,-0.5157167,-0.7753678,0.95081484,0.6024091,-0.27166763,-0.18517709,-0.7850618,-0.56999296,0.5377879,-0.91843915,-0.07015545,-0.2433891,0.1879033,0.766243,0.56563085,-0.7340641,-0.9166286,0.90316314,0.27774963,-0.7117299,-0.669478,0.713664,0.54779845,0.72667545,0.17901815,-0.11372156,-0.42192587,-0.6244738,0.6211125,-0.15416704,0.13390331,-0.06872784,-0.80379915,0.90104806,0.15082014,-0.06377623,0.44404897,-0.8903621,0.54788244,0.1272386,0.74749625,-0.7232579,0.021389602,0.617355,0.20164557,-0.064389676,-0.21567856,-0.3372404,-0.56837153,0.39229867,-0.17406274,-0.8778563,-0.61288136,0.7622401,0.7644952,-0.78164935,-0.20978627,-0.2093024,0.5441424,0.9293116,-0.2314953,0.62729293,0.6764759,-0.2589108,0.5270789,-0.91377413,-0.24288629,-0.82587415,0.778988,-0.5800722,0.25836003,0.21213128,0.11148041,-0.32757324,0.028022852,0.54904103,-0.6105474,0.19283067,0.9146851,-0.07667897,0.11264016,-0.48694402,0.056552716,0.6862042,0.0013429679,-0.21692891,0.7506006,0.51661974,-0.33173478,0.44064167,0.112226576,0.16051617,-0.23487318,0.92705226,-0.51159483,0.26360068,-0.010757951,0.58174133,-0.58431375,-0.32343587,-0.7720095,0.58401597,-0.96776015,-0.5680237,-0.14915982,-0.6533643,-0.7370683,0.98435163,-0.7218616,0.1291116,0.55664957,-0.76116985,-0.035582628,0.7917553,-0.9584502,0.24774754,-0.7395986,-0.7424077,-0.19201723,-0.9032075,-0.10395143,0.23363706,-0.7583966,0.56258684,-0.8094967,-0.5720813,-0.24341147,0.2612126,-0.46104848,-0.68876296,-0.71612424,-0.42011255,-0.7871896,-0.93663496,0.9392619,0.70634896,-0.62711835,0.37327084,0.2553256,0.5581824,0.8925079,0.7844624,0.87179923,-0.40809387,0.21710426,-0.73666024,-0.4631536,0.67077655,-0.40386727,0.49570945,-0.035600297,0.11114509,-0.2383803,0.7735708,0.84236825,0.9848974,0.76691985,0.00038995987,0.91946423,-0.14830753,0.75047934,0.89789927,0.41138998,-0.7072123,-0.43978456,0.15290712,-0.91189414,0.53016263,0.09426052,0.821634,0.59230703,-0.25680268,0.94701254,0.21544272,-0.5057017,0.6503538,-0.27481776,0.30859497,0.25924096,-0.2801048,-0.70689017,0.6655323,-0.81884575,-0.17202194,-0.25071213,-0.3136343,-0.8131566,0.98313755,0.6076184,0.15414134,-0.3749287,0.3825432,0.73826104,0.3224408,0.49080014,-0.2993938]	2026-05-20 07:06:07.985	2026-05-21 08:18:00.733	f	\N	t
d19ec357-922f-4bbe-8d68-e82bdd102434	Set bộ cộc quần áo nữ cao cấp Phong cách hàn quốc thời trang	set-bo-coc-quan-ao-nu-cao-cap-phong-cach-han-quoc-thoi-trang-upwtxi	Phân loại màu: Be / hồng / xanh\nChất liệu: Polyeste cao cấp\nKiểu dáng: Sét bộ mới áo thiết kế cổ bẻ tay ngắn quần chun dạng lưới thoáng mát nhẹ nhàng , phong cách Hàn Quốc\nĐảm bảo chất lượng, form dáng thiết kế hợp thời trang	c1469243-f1d4-42e6-90da-1664a015cdfc	\N	2026-05-21 08:57:27.22	2026-05-21 08:57:27.22	f	\N	t
c5be2391-81bc-4112-96c7-9d6f001fa416	Giường Ngủ Nữ Hoàng Gỗ Hương Đá	giuong-ngu-nu-hoang-go-huong-da-rrr02t	Chất liệu: Gỗ hương đá tự nhiên\nTình trạng: Hàng mới 100%.\nKích thước: 1m6 x 2m; 1m8 x 2m.\nTrạng thái: Còn Hàng.\n\nBảo hành: 2 năm, bảo trì vĩnh viễn.\nChi phí giao hàng:\nGiao lắp miễn phí trong nội thành TP.HCM.\nThời gian giao hàng 24/7	df278796-7010-4462-adea-f59b64b12423	\N	2026-05-21 09:00:26.765	2026-05-21 09:00:26.765	f	\N	t
deb5397a-890f-4699-a7c6-abefc52b6e23	AirPods Pro 3 – Chính Hãng	airpods-pro-3-chinh-hang-rzndya	Chip & Kiến trúc âm thanh\tChip H2, kiến trúc âm thanh đa cổng (multi-port acoustic architecture) để kiểm soát lưu thông khí, cải thiện bass, mở rộng không gian âm thanh và rõ giọng hát hơn.\nThử nghiệm vừa vặn & tips tai\tCó 5 kích cỡ tips silicon + foam-infused, bao gồm XXS, nhằm tăng độ kín tai & cải thiện khả năng chống ồn. Thiết kế bên ngoài tips được xoay vào trong để ổn định hơn.\nChống ồn / Transparency / ANC\tANC mạnh hơn thế hệ trước — ~2×  Transparency mode nâng cấp, Adaptive Audio tự điều chỉnh môi trường; Voice Isolation cho cuộc gọi rõ hơn.\nTính năng đặc biệt\t• Cảm biến nhịp tim (heart rate sensor) tích hợp để đo khi tập thể dục.\n• Live Translation — dịch trực tiếp giọng nói (Apple Intelligence).\n• IP57 chống bụi & chống nước (mồ hôi, nước bắn nhẹ).\nThời lượng pin\t• Lên đến 8 giờ nghe nhạc với ANC bật.\n• Khoảng 7.5 giờ khi bật Spatial Audio + Head Tracking\n• Tối đa 10 giờ nghe trong chế độ Transparency (với tính năng Hearing Aid)\n• Với hộp sạc MagSafe USB-C: tổng ~24 tiếng nghe khi tính cả hộp sạc.\n• 5 phút sạc trong hộp mang lại ~1 giờ nghe.\nKết nối & Công nghệ\tBluetooth 5.3; hộp sạc MagSafe (USB-C) với loa nhỏ & vòng đeo dây (lanyard loop)\nCác phụ kiện đi kèm\t- AirPods Pro 3 (2 tai)\n- MagSafe Charging Case (USB-C) có loa & loop đeo\n- Bộ tips silicon / foam 5 kích cỡ: XXS, XS, S, M, L\n- Tài liệu hướng dẫn\n- Cáp USB-C: bán riêng (không kèm trong hộp)\nKhả năng chống nước / bụi\tIP57 — chống bụi, mồ hôi & nước nhẹ.	323b8bb1-af0d-455f-ad7a-44a513de56a5	\N	2026-05-21 09:21:41.025	2026-05-21 09:21:41.025	f	\N	t
cc9f0adb-1cd7-46a9-bc5e-74733adfb16c	Váy thiết kế thanh lịch và tinh tế	vay-thiet-ke-thanh-lich-va-tinh-te-j5hv4v	Chiếc váy của Mo Han Yi Mei sở hữu thiết kế thanh lịch và tinh tế, mang phong cách hiện đại. Điểm nhấn nổi bật ở phần eo được xử lý khéo léo giúp tôn dáng và tạo cảm giác thon gọn hơn khi mặc. Chất liệu mềm mại, thoáng mát mang lại sự thoải mái suốt cả ngày. Kiểu dáng nữ tính, dễ phối cùng giày cao gót hoặc phụ kiện tối giản để tạo nên vẻ ngoài sang trọng và cuốn hút.\nMàu sắc: trắng nhạt\nChất liệu cao cấp, kiểu dáng thiết kế xu hướng thời trang mang lại sự thoải mái, thanh lịch và thời thượng.	c1469243-f1d4-42e6-90da-1664a015cdfc	\N	2026-05-21 11:45:48.93	2026-05-21 11:45:48.93	f	\N	t
14754302-9e0f-4419-b8f1-0f5d6e6e21a1	Sofa giường kéo ZD1343	sofa-giuong-keo-zd1343-3677ux	Màu sắc\tMàu tùy chọn\nChất liệu\tKhung sofa: gỗ Ash (Sồi Nga / Tần Bì ) đã qua xử lí chống cong vênh, chống mốt mọt\nNệm D40 đàn hồi êm ái\n\nKích thước\t1m8 x 1m9\n1m8 x 1m98 khung sắt ( chưa hộc đồ ) : giá 12tr5\nXuất xứ Việt Nam\nBảo hành 3 năm ( khung, mút ).\nTheo chính sách bảo hành của Zsofa Kiểm tra bảo hành online.	df278796-7010-4462-adea-f59b64b12423	\N	2026-05-21 11:47:31.691	2026-05-21 11:47:31.691	f	\N	t
c91b1cc7-491d-4a43-aa66-5131db286ded	Máy lọc nước RO nóng nguội lạnh Hydrogen Karofi KAD-D66 11 lõi	may-loc-nuoc-ro-nong-nguoi-lanh-hydrogen-karofi-kad-d66-11-loi-ziez99	Kiểu lắp đặt:\nTủ đứng\nLoại máy:\nMáy lọc nước RO nóng nguội lạnh Hydrogen\nCông nghệ lọc:\nThẩm thấu ngược RO\nKháng khuẩn:\nNano Silver\nDung tích bình chứa:\nTổng 8 lít (Nước nóng 2 lít, nước lạnh 1 lít, nước thường 5 lít)\nTỷ lệ lọc - thải:\nLọc 5 - Thải 5 (Tỷ lệ này phụ thuộc vào chất lượng nước đầu vào)\nCông suất lọc:\n20 lít/giờ\nCông suất tiêu thụ điện trung bình khoảng:\n0.545 kWh\nNhiệt độ nước hãng công bố:\nNóng 85 - 95°C, Lạnh 8 - 10°C\nNhiệt độ nước thực tế:\nNóng 80 - 90°C, Lạnh 8 - 14°C, Nhiệt độ nước thực tế sẽ phụ thuộc vào nhiệt độ môi trường và thể tích nước lấy ra\nChỉ số nước:\npH 7.0 - 9.5, Hydrogen ≥ 100 ppb\nĐộ pH thực tế:\n7.0 - 9.5 pH, Yêu cầu nước đầu vào đạt QCVN 01-1:2018/BYT\nÁp lực nước yêu cầu:\n21/414 kPa\nNơi sản xuất máy bơm:\nViệt Nam\nNăm ra mắt:\n2021\nThương hiệu:\nViệt Nam\nNơi sản xuất:\nViệt Nam	fd492d86-0039-4caa-9520-ae6b47f42b0c	\N	2026-05-21 12:13:14.613	2026-05-21 12:13:14.613	f	\N	t
4fbf0a8e-3761-4e0c-8518-95e14d45f855	Bàn làm việc văn phòng chân trắng mặt gỗ	ban-lam-viec-van-phong-chan-trang-mat-go-lcxgte	Chất liệu:gỗ công nghiệp, chân sắt\nKích thước:Dài 1200 – Rộng 600- Cao 750(mm)\nBảo hành:12 tháng\nChú ý:NHẬN ĐẶT HÀNG THEO YÊU CẦU CỦA KHÁCH\nMàu sản phẩm:Vàng sậm, chân đen hoặc chọn theo mã màu	df278796-7010-4462-adea-f59b64b12423	\N	2026-05-21 08:58:45.006	2026-05-21 08:58:45.006	f	\N	t
af28dfc2-91ef-4715-93a6-6e5e42b4b15d	 Bộ suit cưới 3 mảnh | Infinite Love | May vest màu xanh navy	-bo-suit-cuoi-3-manh-infinite-love-may-vest-mau-xanh-navy-hfep9c	Bộ suit cưới Infinite Love gồm một suit jacket, một áo ghi lê (waistcoat) và quần tây (trousers). Màu xanh navy huyền thoại cùng kiểu dáng cổ điển của suit Infinite Love đại diện cho vẻ đẹp tinh tế vượt thời gian. Vải Cashmere bền và ít nhăn, tôn lên đường nét cơ thể của người mặc	4ab98079-550b-45f0-83b7-6aec19e7ccb5	\N	2026-05-21 09:02:03.516	2026-05-21 09:02:03.516	f	\N	t
d4bfe112-a4db-4ccd-8280-ba952215e317	Tai nghe chụp tai Gaming Havit HV-H2232D	tai-nghe-chup-tai-gaming-havit-hv-h2232d-o7y7pv	Công nghệ âm thanh\t\nÂm thanh vòm ảo\nMicro khử tiếng ồn\n\nMicro\t\nCó\n\nCổng kết nối\t\n3.5mm\n\nHãng sản xuất\t\nHavit	323b8bb1-af0d-455f-ad7a-44a513de56a5	\N	2026-05-21 09:23:28.987	2026-05-21 09:23:28.987	f	\N	t
6176c2a5-1313-4510-8a82-f468a30c7360	Áo sơ mi nam tay ngắn – Áo đũi nam thoáng mát cho mùa hè	ao-so-mi-nam-tay-ngan-ao-dui-nam-thoang-mat-cho-mua-he-6qianc	Chất liệu đũi nhăn nhẹ – mát, nhẹ, thoáng khí\nThiết kế áo sơ mi nam tay ngắn, form casual thanh lịch\nPhù hợp mùa hè, dễ phối đồ hằng ngày\n4 màu thời trang: trắng, đen, xanh baby, xanh navy\nLý tưởng cho đi làm, dạo phố, du lịch	4ab98079-550b-45f0-83b7-6aec19e7ccb5	\N	2026-05-21 11:52:02.81	2026-05-21 11:52:02.81	f	\N	t
6200cfd7-34c8-4f4d-8a7a-1e7269036d13	Áo da bò nam thời trang Navy AKD008 Màu đen	ao-da-bo-nam-thoi-trang-navy-akd008-mau-den-w4amuj	Áo da nam thời trang Navy AKD008: Biểu tượng của sự lịch lãm và nam tính. Chất liệu da cao cấp, mềm mại, bền bỉ. Thiết kế hiện đại, ôm dáng, tôn lên vẻ đẹp mạnh mẽ. Màu đen kinh điển, dễ dàng phối đồ. Đủ size M-4XL, phù hợp mọi vóc dáng. Thích hợp cho nhiều hoàn cảnh, từ dạo phố đến dự tiệc. Khẳng định phong cách riêng biệt và đẳng cấp. Mua ngay để trải nghiệm!\n\n\nChất liệu: da bò thật\nMã sản phẩm: AKD008\nChất liệu lót trong: Cotton/pvc\nMàu sắc: Đen, nâu, vàng\nTính đàn hồi: Không co dãn\nThương hiệu: Navy\nKiểu dáng:  Form dáng ôm vừa vặn\nChiều dài: Dáng ngắn, phong cách hiện đại.\nĐộ dày: Vừa phải	4ab98079-550b-45f0-83b7-6aec19e7ccb5	\N	2026-05-21 11:53:31.074	2026-05-21 11:53:31.074	f	\N	t
0edd5422-68eb-4e94-9030-b9a67afea7dd	OPPO Pad 5 (8GB+256GB) Wifi	fresh-bamboo-cheese-1wg-plw6kv	Màn hình: 13" Liquid Retina IPS\nCamera sau: 12MP\nCamera trước: 12MP\nCPU: Apple M4\nRAM: 12GB, bộ nhớ: 128GB\nHệ điều hành: iPadOS 26\nTình trạng: Hàng New, Chính Hãng	5ced1805-e014-4eae-a4fb-af7d1e90ff64	[0.5440473,0.0018599302,0.7340456,-0.9984624,0.48262295,-0.5598613,0.66724735,0.4680315,0.50589365,0.71286887,-0.30457014,0.8905798,-0.2880087,-0.95755726,-0.7291776,-0.4451231,-0.32692736,0.24441351,0.053796127,0.52647036,-0.5465807,0.17208992,-0.22148804,-0.6381281,0.90910786,-0.3908423,0.8905733,0.8827885,-0.9960058,0.6695486,-0.20594795,-0.796109,-0.53167623,-0.4869801,-0.66650623,-0.22260617,0.8073334,0.030479915,0.51049346,0.6596681,0.5006718,0.5443198,0.47073096,0.17136191,0.93156284,0.751444,-0.34708065,-0.27711204,-0.4534003,0.8524461,-0.40891507,-0.9998737,-0.9301643,-0.29831663,-0.8195588,0.28822133,0.4523213,0.6685013,0.7669512,0.7933745,-0.1533493,-0.86216295,-0.17247014,0.6571307,-0.4323516,0.3633123,-0.0996891,0.20762688,0.90887785,-0.72178406,0.35877502,0.024493946,-0.2657689,-0.16761811,0.31923977,0.5155325,-0.9137527,-0.6329155,-0.7094784,0.8881576,-0.10227045,0.3825546,0.6331372,0.3896732,-0.7568313,0.7468909,-0.8346525,-0.21289761,0.75285923,-0.04560852,0.30699307,-0.26414716,0.73284465,-0.12931491,0.009569693,-0.0015863017,-0.9269762,-0.12656137,0.99991,-0.51443535,-0.44260442,0.65100306,0.74372846,-0.06770647,0.8398481,-0.99032915,-0.24361978,-0.26563734,-0.10834043,0.20112579,0.73394805,0.5349008,-0.79977655,0.16158994,-0.28797606,0.121242106,0.59686875,-0.70812786,0.3148666,-0.590154,0.3070603,0.9010564,-0.56962645,-0.55165076,0.5220651,-0.7518678,-0.2346167,-0.47383237,0.5000427,0.91918194,-0.67392135,-0.042460285,-0.5139502,-0.9701802,-0.877814,-0.7618184,0.08241358,0.89780724,0.4383132,0.27909538,-0.73731416,-0.18105914,0.96915,-0.6027871,0.22815044,0.39580992,0.7807569,0.91317433,0.4693276,0.64270914,-0.3592772,-0.7760767,0.6700512,-0.025172064,-0.28051615,0.45656434,0.931401,-0.6192101,-0.04754144,0.20331998,-0.005463693,-0.0002618779,0.5315899,-0.60128415,0.90006495,0.57390094,0.723511,0.82343984,0.4534887,-0.89620346,0.72218764,-0.37885436,-0.5093685,0.36897442,0.14344811,0.3620924,-0.80328625,0.6946131,-0.6722641,-0.9450805,-0.8689508,0.14714658,0.7348245,0.72900903,0.52296084,-0.80530787,0.960157,0.44497737,-0.87118095,0.38678315,-0.89289314,-0.90372854,-0.5889258,0.46082294,-0.8124093,-0.5464133,0.109139845,-0.85956174,-0.5934735,-0.33942068,-0.3973033,0.06514467,0.4719571,0.35683766,0.6585261,0.91378987,0.77233046,-0.26334494,-0.52982557,0.53713197,0.46038276,0.3945846,-0.060163632,-0.31274256,-0.6634772,-0.7172689,0.7515669,-0.28338227,-0.75552255,0.8233442,-0.8384552,-0.12530123,0.91086185,0.9324864,-0.008983496,0.28476194,0.800217,0.96680063,0.46297017,0.03871197,0.5180197,0.78200644,0.4324247,0.2054481,-0.6873038,0.71322834,-0.14539799,-0.124977164,0.6628966,0.24459082,0.16103193,-0.07979262,0.25041157,-0.8363486,-0.8185497,0.13655438,-0.7592796,0.44629103,0.36990666,0.94144964,-0.7010976,0.76574475,-0.09855468,-0.66490966,0.4647162,0.68444747,0.95339334,0.962845,0.6386532,0.17590445,0.014771408,-0.85360956,-0.29025036,-0.29081556,0.5053639,-0.55902535,-0.09215699,-0.7368053,0.1251995,-0.82313806,0.2577975,0.12763265,0.09479135,-0.30337805,0.11922129,-0.8964465,0.9012333,0.18188988,-0.14801143,-0.7943983,-0.09977292,0.019651871,-0.29533157,-0.6089299,0.6601984,0.46637997,0.91887915,0.8672165,0.42365924,0.738099,0.57668775,0.39045158,-0.3563361,0.084146835,-0.37592253,-0.043644488,-0.034954473,-0.50210947,0.29116842,0.58651143,-0.9512936,-0.298781,-0.23017782,0.84324974,-0.4501539,0.15404683,-0.57849574,-0.7257799,0.550687,0.48513302,0.18892452,0.24912757,0.16007532,-0.67557734,0.6931797,0.27825722,-0.89222443,0.393096,0.5390142,-0.9420866,-0.62310743,-0.6911411,0.68219894,-0.73691994,0.019425262,-0.8339527,0.6640714,0.4805869,-0.18606806,-0.42137226,-0.30923712,-0.5391101,0.04041598,0.054563574,0.65148157,0.44875452,-0.72944754,-0.7176915,-0.23260322,-0.14886828,0.7182879,-0.40869188,-0.6702073,-0.620995,-0.1819519,-0.76650256,0.73938435,-0.8352924,0.09966976,0.03959086,0.55659574,-0.6392771,0.2220565,0.27544978,-0.4550153,-0.14583407,0.6948905,-0.53836787,0.6900638,-0.6282299,0.794688,-0.71699,-0.12264021,0.2030756,0.38708386,0.49615303,0.46860713,-0.65639514,0.5034717,0.69520694,-0.38568512,0.61162573,-0.11673857,-0.13350062,0.15623464,-0.1530162,0.86151886,-0.376998,0.31756067,-0.9002261,0.9105821,0.41215855,-0.4654737,0.46741137,0.81234956,-0.8976852,-0.8828962,-0.6326732,-0.55011797,-0.081235796,0.7815773,-0.12368253,-0.80826914,-0.83197844,0.15915075,0.13175227,0.15041722,0.597377,0.62927663,0.57214516,0.078553095,-0.4075706,0.11522062,-0.80522496,0.43492272,-0.2741456,0.88789225,0.25646973,-0.42929503,-0.8351536,-0.4720423,0.022139747,-0.49620664,0.47327602,0.7593932,-0.46418902,-0.5990106,-0.94274294,0.74177814,-0.16246255,-0.5441979,0.9851083,0.59542584,-0.9907152,0.5652375,0.5719888,-0.37234846,-0.90216386,-0.76516145,0.7071988,-0.23698029,-0.847086,-0.17042515,0.4484505,-0.8217359,0.3492241,-0.7184845,0.89278233,0.94625,0.45723385,0.040608354,0.97425,0.24992082,-0.8082248,-0.86741865,0.3793084,-0.49527425,-0.52846354,-0.57069916,-0.8729036,0.985094,0.16229355,0.54194754,-0.862966,-0.71262074,-0.24921648,0.60999954,-0.0997701,-0.81958514,0.50966376,0.6121671,0.19203533,-0.77596563,-0.39964014,-0.26674485,-0.016837258,0.6915562,0.082486436,0.8903412,-0.86320174,0.64541703,0.10229476,0.8387131,0.8401562,-0.82536626,0.8637147,-0.65608126,0.758138,-0.34626445,0.57426417,0.17900778,0.23529881,-0.32911697,-0.6670022,0.6636614,-0.92806363,-0.2897116,0.570052,-0.48843363,-0.64790064,0.20840548,0.8887556,0.6882538,0.081368595,0.82549995,-0.34812182,-0.30953196,-0.46305937,-0.35075635,-0.3596961,-0.11588706,0.24268502,-0.49377617,0.22829324,0.4651352,0.66621685,0.2400584,-0.190031,-0.6943987,0.34308407,0.8820674,0.005625656,-0.60214895,0.3666561,-0.51713496,0.14263797,-0.4013429,-0.85115415,-0.26981091,0.3770151,0.28690916,0.41566053,0.75905895,0.31784987,-0.88903946,-0.96261626,0.83909273,-0.5861693,-0.43100223,-0.68218917,0.23468089,0.5992962,-0.19418307,0.14484197,0.49525434,0.13772339,-0.58797646,-0.27221632,0.25083083,-0.8924823,0.41340902,0.8142429,-0.5634736,0.68443346,0.6286159,0.5212373,-0.70772403,-0.6557403,0.6400389,-0.777359,-0.77808815,0.8061445,0.11683666,0.3152048,-0.97643846,-0.28431058,-0.15030093,0.9213609,0.23457885,0.6437134,0.93366927,-0.8181638,-0.7483364,0.14779368,0.9792009,0.1912453,-0.19967508,0.7768316,0.42017204,-0.4971666,-0.89117193,-0.6912664,-0.56426287,-0.55710596,0.2373284,0.07487718,0.93426824,0.8169986,-0.9504895,-0.0393704,0.8322271,-0.2943557,-0.19688492,-0.5445025,-0.6229106,0.43765253,-0.76219714,0.11558584,0.7964033,0.6069798,0.18288964,-0.5344533,0.50818956,-0.688839,-0.17289959,0.70050395,-0.7713404,0.8182612,0.14387354,-0.7967061,0.820922,-0.8159919,0.041242,-0.5650435,0.5972167,0.10613834,-0.15195556,-0.45469984,-0.81011957,-0.17300744,-0.63359636,-0.17189999,-0.84949297,-0.5777313,-0.90389365,-0.44915307,0.13141629,0.05897577,-0.10012879,0.5045832,-0.23711447,-0.14326315,0.84517574,-0.87582266,0.3912302,-0.44084048,0.8323524,-0.18138129,-0.48991925,-0.7506017,0.238496,0.42904502,-0.2272412,0.680367,-0.54504573,0.6583002,0.7791238,0.5491965,0.52813286,0.80584955,0.028587021,0.14261411,0.36278433,0.6043863,-0.48945805,0.7068253,0.6465309,0.66889733,0.9896505,0.49480048,-0.020023767,-0.9826649,-0.33322403,-0.95851487,-0.57078254,-0.1861786,-0.6498252,0.6668743,0.07854925,0.4658415,-0.54804134,-0.6680556,-0.8295369,0.66879535,0.110079125,0.09102364,0.08741821,-0.48625296,-0.39612544,-0.40168923,0.30744448,-0.45873293,-0.9315617,-0.8913292,-0.4880988,0.73183143,-0.63988644,-0.5307091,-0.7800374,-0.51407075,0.7161584,-0.3628145,-0.8748008,0.1674201,0.012342458,0.74479955,-0.45153615,0.33722597,0.607065,0.9258262,-0.20477,-0.641619,0.6068796,-0.8598535,-0.18117101,0.25582716,0.780083,-0.7146231,-0.578455,0.51078075,-0.4384504,0.40521127,0.79922014,-0.3000571,0.0042145844,0.06527646,0.8556614,-0.4450917,0.20922546,-0.8498979,-0.06384182,-0.019426798,0.24026503,0.7736938,0.95831263,-0.9006102,-0.08795464,0.9523033,0.84780467,-0.54759544,-0.09058842,-0.51223147,0.6349374,0.15784585,-0.23411295,-0.4618097,0.27455938,-0.16778432,0.42139137,-0.41144547,-0.96872544,0.7856361,-0.6067882,0.8322745,-0.8598054,0.542147,0.105670296,0.47144103,-0.17331567,-0.051610786,0.21649493,0.8484473,0.96997917,-0.6767449,0.70534444,-0.53059393,0.44945845,-0.61581975,0.7968346,-0.23632248,0.4119857,0.83139473,-0.7517645,0.42587215,0.03799824,0.16170421,0.25315446,-0.39215934,-0.5664373,0.07323597,-0.68059313,0.13129573,-0.07489996,-0.63860685,0.5680691,0.6890469,-0.16815528,-0.75206614]	2026-05-20 07:06:09.187	2026-05-21 08:49:22.019	f	\N	t
ccd909a5-fa59-4253-ae4e-1db9b104e704	Bộ suit cưới | Prince Charming | May vest cưới nam màu trắng	bo-suit-cuoi-prince-charming-may-vest-cuoi-nam-mau-trang-carprx	Bộ suit cưới 3 mảnh Prince Charming gồm 1 suit jacket, 1 áo ghi lê (waistcoat) và 1 quần tây (trousers). Bộ trang phục được may đo từ dòng vải Nobility cao cấp. Với tông trắng sang trọng, thiết kế nam tính, bộ vest mang đến cho chú rể vẻ ngoài lịch lãm, thời thượng.	4ab98079-550b-45f0-83b7-6aec19e7ccb5	\N	2026-05-21 09:02:46.875	2026-05-21 09:02:46.875	f	\N	t
d708039f-b2a9-4868-b262-1793fb19bb25	Dell Alienware 16 Aurora (2025)	dell-alienware-16-aurora-2025-l2bxe9	CPU: Intel® Core™ 7 Processor (Series 2) 240H (24MB cache, 10 cores, 1.80 to 5.20 GHz P-Core)\nRAM: 32GB DDR5\nỔ Cứng: 1TB M.2 PCIe NVMe®\nMàn Hình: 16″ QHD+ (2560x1600) IPS, 120Hz, Anti glare, ComfortView Plus, 100% sRGB, 300 nits\nCard Đồ Hoạ: NVIDIA® GeForce RTX 5060 8GB GDDR7\nTình Trạng: Hàng New, Nhập Khẩu	6cf378c7-d41b-4279-aa96-a19d98111de8	\N	2026-05-21 09:05:43.608	2026-05-21 09:05:43.608	f	\N	t
1e1b58b3-781c-4d3a-b4ff-40002d5fad6d	Nồi chiên không dầu 6L Joyoung JAF-579 | Công suất 2100W | 2 cửa sổ quan sát	noi-chien-khong-dau-6l-joyoung-jaf-579-cong-suat-2100w-2-cua-so-quan-sat-84r4t9	✔︎ Chính hãng 100% Full VAT\n\n✔︎ Bảo hành 24 tháng\n\n✔︎ 1 đổi 1 trong 12 tháng\n\n✔︎ Miễn phí vận chuyển\n\n✔︎ Giao hàng, hướng dẫn lắp đặt tận nhà\n\n✔︎ Hỗ trợ ship hoả tốc nội thành\n\n✔︎ Hỗ trợ dịch vụ đóng gói quà tặng	fd492d86-0039-4caa-9520-ae6b47f42b0c	\N	2026-05-21 09:42:14.202	2026-05-21 09:42:14.202	f	\N	t
50268195-45d5-4cd7-be3e-91f1f249bc22	Asus ROG Zephyrus G14 (2025) (GA403WM-QS051WS) - Ryzen AI 9 HX 370/32GB RAM/1TB SSD/14 3K Oled 120Hz/RTX5060 8GB/Win11&Office/Xám/Sạc/Túi	asus-rog-zephyrus-g14-2025-ga403wm-qs051ws-ryzen-ai-9-hx-37032gb-ram1tb-ssd14-3k-oled-120hzrtx5060-8gbwin11officexamsactui-j29pha	- Bộ vi xử lý: CPU AMD Ryzen™ AI 9 HX 370 (36MB Cache, up to 5.10GHz)\nBộ nhớ: RAM 32GB LPDDR5X 7500 Onboard\nỔ cứng: SSD 1TB M.2 NVMe™ PCIe® 4.0\nCard màn hình: VGA NVIDIA® GeForce RTX™ 5060 8GB GDDR7\nMàn hình: Display 14.0 inch 3K OLED, 120Hz, 100% DCI-P3, G-Sync, ROG Nebula	6cf378c7-d41b-4279-aa96-a19d98111de8	\N	2026-05-21 11:56:25.504	2026-05-21 11:56:25.504	f	\N	t
db10b02c-58f1-402e-bcd4-d7f247ed54d5	Bộ suit nam 3 mảnh | Sky Blue | May vest màu xanh da trời	bo-suit-nam-3-manh-sky-blue-may-vest-mau-xanh-da-troi-su1n7i	Bộ suit nam 3 mảnh màu xanh da trời Sky Blue gồm một suit jacket, một áo ghi lê (waistcoat), một quần tây (trousers). Các tông sáng như xanh da trời là lựa chọn cực kỳ thích hợp cho mùa hè bởi khả năng bảo vệ da tốt hơn khỏi tia cực tím. Vải may từ thương hiệu Vercelli cao cấp, giúp bộ suit màu xanh da trời Sky Blue lên dáng sang trọng, phẳng phiu.	4ab98079-550b-45f0-83b7-6aec19e7ccb5	\N	2026-05-21 09:03:50.302	2026-05-21 09:03:50.302	f	\N	t
b0fd4c30-13c4-41ee-8f5f-7a570bea23e6	Laptop Lenovo LOQ Gaming 15IRX10 83JE00PEVN (i7 13650HX/ 16GB/ 512GB SSD/ RTX 5050 8GB/ 15.6 inch FHD/ 144Hz/ Win11/ Grey/ 2Y)	laptop-lenovo-loq-gaming-15irx10-83je00pevn-i7-13650hx-16gb-512gb-ssd-rtx-5050-8gb-156-inch-fhd-144hz-win11-grey-2y-m4f9xu	Kích thước\t\n15.6 inch\nĐộ phân giải\t\nFHD (1920x1080)\n\nCông nghệ màn hình\t\nIPS, Anti-glare, G-SYNC\n\nTần số quét\t\n144Hz\nĐộ sáng\t\n300nits\nĐộ phủ màu\t\n100% sRGB\nThiết Kế\nChất liệu\t\nPC-ABS (Top), PC-ABS (Bottom)\n\nKích thước\t\n359.86 x 258.7 x 21.9-23.9 mm\nTrọng lượng\t\n2.4 kg\nMàu sắc\t\nXám\nBàn phím & Touchpad\t\nBàn phím: 24-Zone RGB Backlit, English\n\nTouchpad: Buttonless Mylar surface multi-touch touchpad, supports Precision TouchPad (PTP)\nThông tin chung\nThời điểm ra mắt\t\n2025\n\nHệ điều hành\t\nWindows 11 Home\n\nRAM\t\n16GB DDR5-4800, 2 khe cắm, hỗ trợ tối đa 32GB\nỔ cứng\t\n512GB SSD M.2 2242 PCIe 4.0x4 NVMe\nBảo mật\t\nKhông bảo mật dấu vân tay\nBộ xử lý & Đồ họa\nBộ xử lý (CPU)\t\nIntel Core i7-13650HX (14 nhân, 20 luồng, Max 4.9GHz, 24MB Cache)\n\nĐồ họa (GPU)\t\nNVIDIA GeForce RTX 5050 8GB GDDR7 (TGP 100W, 440 AI TOPS)\nKết nối & Cổng\nKết nối không dây\t\nWi-Fi 6 (802.11ax 2x2), Bluetooth 5.2\n\nCổng kết nối\t\n1x USB-C (10Gbps/3.2 Gen 2, PD 65-100W)\n3x USB-A (5Gbps/3.2 Gen 1)\n1x HDMI 2.1\n1x Headphone/microphone combo (3.5mm)\n1x RJ-45, 1x Power connector\nÂm thanh & Camera\nÂm thanh\t\n2 Loa\n\nWebcam\t\n5.0MP with E-shutter\n\nPin\nLoại pin\t\n3-Cell\nDung lượng\t\n60Wh	6cf378c7-d41b-4279-aa96-a19d98111de8	\N	2026-05-21 09:07:32.098	2026-05-21 09:07:32.098	f	\N	t
4fa704d7-8f58-4fee-819c-913f8583bf99	Máy ép trái cây tốc độ chậm Kuvings NS-924CBC2 400ml	may-ep-trai-cay-toc-do-cham-kuvings-ns-924cbc2-400ml-j5y9tm	Máy ép trái cây tốc độ chậm hiệu Kuvings NS-924CBC2 dung tích 400ml được sản xuất từ linh kiện cao cấp có độ bền cao và nhựa không chứa chất độc hại\n\nThiết kế nhỏ gọn, nhiều màu sắc trẻ trung, sang trọng, hiện đại và an toàn luôn luôn có mặt trong mọi không gian nhà bếp.\n\nNhằm đáp ứng nhu cầu cải thiện sức khỏe, làn da từ trái cây và rau củ quả tươi từ thiên nhiên mà vẫn giữ được Vitamin, Enzym, hương vị và màu sắc tự nhiên của trái cây và rau củ quả tươi thì Thương Hiệu Kuvings đến từ Hàn Quốc chuyên sản xuất các sản phẩm nhà bếp, gia dụng nói chung đã cho ra đời những mẫu máy ép trái cây tốc độ chậm hiệu Kuvings cao cấp với công nghệ ép tốc độ chậm “Cold Pressed Juicing” mới nhất cho thị trường Việt Nam dựa trên nguyên tắc ép trái cây và rau củ quả trong môi trường ít không khí với dao ép không sinh nhiệt và tốc độ ép cực chậm bằng lực cưỡng bức cho ra lượng nước ép nguyên chất tươi nhiều gấp 1.5 lần và thơm ngon mà không bị tách nước nhanh.	fd492d86-0039-4caa-9520-ae6b47f42b0c	\N	2026-05-21 09:44:21.215	2026-05-21 09:44:21.215	f	\N	t
0e280f36-d54e-4b1a-93dd-4067c020bea7	Laptop DELL Latitude 7320 (I5-1145G7 / 16GB RAM / 256GB SSD / Màn 13.3 inch FHD / Kèm sạc) - Hàng cũ đẹp	laptop-dell-latitude-7320-i5-1145g7-16gb-ram-256gb-ssd-man-133-inch-fhd-kem-sac-hang-cu-dep-2hkil6	- Loại card đồ họa: Iris Xe Graphics\n- Dung lượng RAM :16GB\n- Loại RAM: LPDDR4X\n- Số khe RAM: 1 khe 16GB\n- Ổ cứng: 256GB NVMe M.2 PCI\n- Kích thước màn hình: 13.3 inches\n- Công nghệ màn hình: Công nghệ chống chói\n- Hệ điều hành: Windows 11\n- Độ phân giải màn hình: 1080 x 1920 pixels (FullHD)\n- Loại CPU: i5-1145G7	6cf378c7-d41b-4279-aa96-a19d98111de8	\N	2026-05-21 12:00:39.412	2026-05-21 12:00:39.412	f	\N	t
26e5e622-39e9-4b92-8695-5844dfa9b2fe	iPhone 17 Pro Max 256GB | Chính hãng Việt Nam	intelligent-bamboo-pants-vds-DwZjvC	Apple đã chính thức ra mắt iPhone 17 Pro Max vào lúc 0h00 ngày 10/09/2025 trong sự kiện "Awe Dropping". Flagship dòng Pro cao cấp năm nay đã trở thành “đỉnh cao công nghệ” với hàng loạt cải tiến về thiết kế, hiệu năng mạnh mẽ và công nghệ camera đột phá. Chính vì vậy, iPhone 17 Pro Max 256GB nhanh chóng trở thành chiếc smartphone đẳng cấp và đáng mua nhất năm 2025.Hệ thống ủy quyền chính hãng của Apple tại Việt Nam khám phá lý do vì sao không nên bỏ lỡ siêu phẩm này nhé. 	b7079621-c838-4e4a-a725-7750e2e31c5e	[0.92368037,0.52450687,-0.5685749,0.48508245,-0.4949165,0.51635414,-0.9150537,-0.6809268,0.07952801,-0.9725056,0.5075937,-0.9968808,0.084662504,-0.5394893,-0.9802881,0.0020834731,-0.69580704,0.034390483,0.00010350583,0.049851064,0.7338595,-0.25780654,-0.33237818,-0.13907138,0.27775684,0.511317,0.38146612,0.11962104,-0.9122805,-0.57667047,0.4364339,-0.27964738,-0.91959786,-0.43041345,-0.7018095,-0.89454496,-0.39266625,0.4614036,-0.3861633,0.825408,0.9790221,0.9934921,-0.28864327,-0.5102786,0.43901703,0.20440295,0.906166,0.74009746,0.23672096,0.11342426,-0.23791827,-0.67482096,0.8581874,0.019301957,-0.02337621,-0.8141055,0.6775097,0.5010958,0.10412636,0.14763424,-0.08426156,-0.96913457,0.48567098,-0.056768034,0.053326428,-0.5760148,0.25873998,-0.5184522,-0.316994,0.11163209,-0.22342545,0.85137415,-0.6534975,-0.004533589,0.30853152,-0.09792098,0.16337305,-0.6180585,-0.09887103,-0.85003465,0.61976904,-0.62736607,0.844054,0.73975754,0.9695348,0.63146925,-0.14264172,-0.03822165,0.80796814,-0.055119302,0.54793864,-0.5555161,-0.075946204,0.8091659,0.5410877,0.8196711,0.23392074,0.033792242,-0.54533905,-0.9922119,-0.30175892,0.39127943,0.16281688,-0.86270255,-0.65287215,0.29758254,-0.8735312,0.8621245,0.21627983,0.7021372,-0.03220839,0.9998372,-0.7459317,-0.6092205,0.9626663,-0.52575374,-0.7271695,-0.6164517,-0.8200531,-0.4029514,0.8917524,0.76408607,-0.94844246,0.37040716,-0.21193628,0.6318753,0.6968064,0.51252097,0.47441497,-0.955927,0.580588,-0.25585136,0.15270925,0.2912601,-0.06706661,-0.100340694,-0.0053814696,0.538428,0.33026627,-0.6905548,-0.22383787,0.1838729,0.9248917,-0.3399989,0.5935677,-0.40095666,0.7036167,0.39711002,0.0020477553,-0.50188327,-0.46470642,0.9283191,0.8097313,0.3353781,0.19086261,-0.7645914,0.8488802,-0.53754693,0.34593022,-0.051422372,-0.8661013,-0.6007101,-0.22114962,0.3897452,-0.30413282,-0.39606914,0.8691044,-0.38086966,-0.54166186,0.22069095,0.9311281,0.24262951,0.85136855,-0.5629074,-0.19508654,0.7990238,-0.75493896,0.89493275,0.84994864,-0.44789448,-0.47801736,0.6471421,-0.07447984,0.4037042,0.360077,-0.8359294,0.3684266,0.9140182,-0.7466966,-0.2810403,0.096794434,-0.9850929,0.9422859,0.048143268,0.5447692,0.7168757,0.5635831,-0.15719545,0.89845616,-0.5163935,0.5466809,0.45596105,-0.48614186,-0.7938371,-0.45285103,0.70606077,0.5373505,-0.47837487,-0.6981035,-0.67587465,-0.53158444,0.7766075,0.22369844,-0.7948271,0.14867617,0.8575934,0.047266237,0.6018886,-0.40811992,-0.50060326,-0.554774,-0.1388606,-0.7029737,-0.5616015,-0.044359114,-0.0327949,-0.54317135,-0.29608747,-0.9596828,0.21515411,0.09220412,-0.19914068,0.40156493,-0.8331874,-0.46100906,0.69591033,-0.13743974,0.66455567,-0.9999047,0.82901746,0.932256,0.5870349,0.994363,0.8544504,-0.5584571,-0.8309513,-0.55173564,-0.23058908,-0.2519641,-0.58028746,0.9723884,-0.9124227,0.40392333,0.3581691,0.77344054,0.22070411,0.35400745,-0.060898475,0.91431814,0.41244012,-0.2768683,-0.12836993,0.4013561,-0.51615477,0.56739694,-0.27849254,0.4224172,0.8461077,0.42537305,-0.29894185,-0.202448,-0.3909775,-0.70937276,-0.74595565,0.20895544,-0.68261397,-0.60834396,0.59870046,0.7238272,-0.8158748,-0.9950145,-0.7471675,-0.6058345,-0.026230233,0.43057394,-0.78492147,-0.5842997,0.44888082,0.9342345,-0.32034108,-0.38196185,-0.47801986,0.6296343,0.117227584,-0.007901638,0.52884537,0.7113892,0.6293153,0.14191547,0.69921196,-0.45361018,0.4512165,0.6567212,0.1260581,0.22028968,-0.8064318,-0.027922638,0.37636587,-0.06453902,-0.4774922,-0.6640866,0.80219066,0.33269033,-0.6699189,-0.06529356,-0.9044339,-0.31781217,0.14354129,-0.95242727,-0.47861618,-0.4451189,-0.11259974,0.04142325,0.08481896,-0.92592406,0.80432355,0.48785266,0.35124016,0.08679404,-0.05489984,-0.91835785,0.58391804,-0.5157621,0.2280582,0.50596035,-0.37846252,-0.8270966,-0.4844348,0.9408955,-0.48802686,0.43587518,0.30115566,0.346456,-0.63725036,-0.2069321,-0.66066587,-0.41834617,0.21338034,-0.08960899,0.35879666,-0.045193996,-0.30331123,0.6040995,0.66469413,0.28129286,0.25271413,-0.65440816,0.14492324,-0.5999764,0.0043635676,-0.93798023,-0.42978626,0.71372306,0.46121767,-0.26873392,0.70816785,0.86143243,0.17618361,0.24613187,-0.42103976,-0.4077061,0.11918701,0.22963294,0.2936942,0.30999675,-0.70520943,-0.67311627,-0.52664727,0.98302794,0.6106868,-0.3585314,-0.23415828,0.3924604,-0.06903521,0.38629282,0.06903179,0.96579975,-0.87762845,0.3773237,-0.8309129,-0.47137073,0.16351289,-0.16728526,-0.53097945,0.5349866,0.92299414,0.0003134481,-0.8167814,0.68675,0.2128652,-0.4851954,0.33209646,0.29976088,0.7390608,-0.7620112,0.57251644,0.6678035,-0.7029826,0.780663,-0.6733787,-0.5696254,0.64976066,0.8318298,-0.9269206,0.50989014,0.14444694,0.47599742,-0.9485511,0.617931,0.7398884,-0.8643482,-0.45039856,-0.5684403,0.167968,0.5498482,-0.6992439,0.91319466,-0.67396593,0.56303334,-0.684326,-0.6081038,0.5262305,-0.42966276,0.018907793,-0.7381668,-0.8044167,0.9189066,-0.59741884,0.09524495,-0.8937004,-0.3590062,0.1479506,0.3206862,-0.63793945,-0.93729365,-0.09623424,-0.44885796,-0.07256983,-0.08794325,0.38670772,-0.93128735,-0.5439702,0.52928567,0.7166758,-0.47189346,0.116484664,0.17670903,0.13471927,-0.6268489,-0.6594788,-0.25889555,-0.8188032,-0.7525031,-0.16989389,-0.30061743,-0.45629776,-0.75401664,0.64026487,0.6044662,-0.29165572,-0.21292497,-0.16738383,0.66445535,-0.7517689,-0.56490016,0.1674506,0.11878066,0.10530963,0.678168,0.5849973,-0.4773809,-0.52389985,0.6199648,-0.8217027,-0.86511785,0.5487024,-0.7929593,-0.12141235,-0.34971732,-0.67762613,0.9387289,-0.3989819,0.088719666,0.97610456,-0.100882284,-0.00987555,-0.73455447,-0.7518479,-0.2503437,0.37992144,-0.25519043,-0.43251905,0.11219158,0.39230096,0.1214823,0.17728297,-0.7591791,-0.95510995,-0.7608738,0.23156965,-0.64277184,0.06573378,-0.53398836,0.4332795,-0.39629298,0.1636058,0.65520835,0.22572896,-0.82387155,-0.09728146,0.46815702,-0.5150225,0.5371621,-0.33632335,-0.7269893,-0.87504137,-0.6712861,0.47698703,0.28387004,0.94601727,0.8717827,-0.6687867,-0.9110313,0.76285356,-0.78800344,0.01442277,0.3524595,0.7605681,-0.37495133,0.49365377,0.7750492,0.57416,0.9735965,0.2999865,-0.48085925,0.70594865,-0.7860676,-0.03397161,-0.17104124,-0.52303165,0.16969222,-0.4584563,-0.18910654,0.73384094,0.18233924,-0.67592037,0.39868426,0.59508616,0.0016293518,0.38235092,0.99373597,0.9429769,0.112665065,-0.70201844,-0.97667867,-0.35421264,-0.5832571,-0.44346854,0.97013485,-0.79833156,-0.33356434,0.242135,-0.27547202,-0.7487595,0.14701545,0.005845249,0.8251982,-0.2713291,-0.8674608,0.48228574,-0.35853386,-0.2798043,-0.8011575,0.50248826,0.18156369,0.41845295,-0.52384377,0.7149485,0.14038907,0.041755393,0.1375407,0.56467813,0.63751113,-0.89881396,0.41146097,-0.4385016,0.41694552,-0.74980694,-0.7769896,0.068134,0.8347548,0.33788818,-0.74647725,0.7002621,-0.5504187,-0.6422766,0.96398854,0.41855487,0.029279185,0.7602069,-0.81177366,0.640528,-0.20227654,0.5988356,0.072488576,0.25542971,-0.16101712,0.082497895,0.4680358,0.42586005,-0.4893753,0.43066078,-0.7265242,0.29543597,0.34850076,-0.15955606,-0.477852,0.85107154,-0.44636825,-0.07786015,-0.12067217,0.5985996,0.5487715,-0.23482217,0.75664145,0.35305575,-0.12607023,0.72893333,0.4344138,-0.5169681,0.5248557,-0.65950376,-0.5630303,0.07002296,0.5838276,-0.36247298,-0.09559085,-0.19458693,0.1815058,0.23282681,0.27224818,-0.713187,0.6945825,0.86948514,-0.6328125,-0.982184,0.2854315,0.95576316,0.56656253,-0.5066819,0.68398434,-0.25781256,-0.75331795,0.37358758,-0.6046678,-0.8982576,0.9985723,-0.31203827,0.51144636,-0.8772272,-0.35503802,0.29880595,-0.14375362,-0.88241225,0.21026134,-0.33498102,-0.9357379,0.41387483,0.3050082,-0.8153484,0.9270094,0.9343903,-0.23119083,0.6563571,0.34225753,-0.52693075,0.25352722,-0.55535346,-0.67113954,-0.947747,0.49845496,0.53757775,0.743828,-0.72753423,-0.9617801,-0.74989367,0.57147455,0.86433387,0.7617571,-0.6159057,0.5058446,0.64221007,-0.3361072,-0.939674,0.3987622,0.99708205,0.15453407,-0.9286541,-0.42485026,0.67008936,-0.45802525,-0.6268583,-0.040607676,0.37259436,-0.9976135,-0.52712905,-0.8761112,0.09520668,0.7692076,0.4960284,0.7295803,-0.56414956,-0.7236958,-0.6562647,-0.060763016,-0.6503576,-0.32173228,-0.67360014,0.25201795,-0.8326849,-0.8899208,-0.2792396,0.4498367,-0.434486,0.33025536,0.6040979,0.15155767,0.68471134,0.23558685,-0.13506266,0.89998865,0.30708295,0.2443213,0.55664253,-0.8276002,0.13376576,0.35989645,-0.09510867,0.28450644,-0.73253846,-0.16640665,0.42289424,0.20739537,0.45348087,0.7449322,-0.6183445,0.06564913,0.86801225,-0.68909854,-0.7851568,-0.6901696,0.15340297,0.15791395,0.95279384,0.75052106,-0.65742487,-0.3788312,0.37504655]	2026-05-20 07:06:08.045	2026-05-21 08:15:33.158	f	\N	t
9abc6cdf-d54b-4b24-9ccf-832628adeeff	Điện thoại Realme C85 8GB	fresh-rubber-ball-jle-Cg18JG	Trong phân khúc điện thoại phổ thông, hiếm có chiếc máy nào lại sở hữu những thông số "ngông cuồng" như realme C85 8GB 128GB. Đây không chỉ là một thiết bị di động thông thường, mà là một cỗ máy bền bỉ được thiết kế để chịu đựng những môi trường khắc nghiệt nhất. Nếu bạn đang tìm kiếm một chiếc điện thoại không bao giờ hết pin giữa chừng hay có thể thoải mái rửa dưới vòi nước, realme C85 8GB 128GB chính là câu trả lời đanh thép nhất từ nhà realme.	b7079621-c838-4e4a-a725-7750e2e31c5e	[-0.6653673,-0.16716525,-0.43306828,-0.40625778,-0.24661723,0.6228187,0.19886856,0.39214274,-0.7661807,-0.7336658,-0.48612702,-0.01958725,0.42147171,0.46933234,-0.4718005,0.74494296,-0.20433426,-0.9642406,-0.15257214,-0.22783636,-0.7488937,0.67014563,-0.8865471,0.93782955,0.6379195,-0.43060938,0.6247199,0.86744535,0.76668805,0.9956448,0.5906157,0.6552968,-0.66270393,-0.56761914,-0.87822604,-0.64373565,0.08590881,0.23947412,0.4629332,0.9170112,-0.7569596,-0.1680001,-0.9087025,-0.2924146,0.8786153,0.3956237,0.13970156,-0.17729346,-0.7848177,0.57113713,0.8593164,0.33567512,-0.5469812,0.15305519,0.61917865,-0.65370095,0.678449,0.6652344,0.085538276,0.47873875,0.7089031,0.23193955,0.4025408,-0.23225573,-0.5001414,-0.8366806,0.39649191,-0.5146371,0.81593215,-0.7443328,0.080235064,-0.79645926,-0.92899597,-0.6383864,0.6312809,-0.28148255,-0.214072,-0.86762327,0.8080517,-0.047237024,0.31702858,-0.071382366,-0.483466,0.24898426,0.69130063,-0.9294912,-0.4337195,-0.5165616,-0.3793885,-0.87904537,-0.6397785,0.22675031,0.40527725,-0.86388344,0.53334105,0.48717818,0.44360632,0.5686576,0.6014604,0.8824847,-0.29672733,-0.52744997,0.19866729,0.74610364,0.70495236,0.026682025,-0.5624956,-0.20521048,0.43606588,0.19482024,-0.12544435,0.8869395,-0.8065921,-0.1351937,-0.49330705,-0.9824402,0.51952255,-0.8509696,0.913945,-0.6516498,-0.07272227,-0.8900544,0.2111871,0.4949303,0.10996548,-0.83031934,0.45718095,0.8118587,-0.063901864,-0.3049875,0.949778,0.7837599,-0.7077729,-0.80327517,0.79357547,0.12959634,0.03705333,0.11020889,-0.70392627,-0.052024167,-0.70595753,0.22799486,-0.5122732,-0.5783392,0.32117715,0.10521795,-0.3491367,0.11560424,0.36422956,-0.96837753,0.9521859,-0.61466223,0.47094476,-0.07109452,0.3049632,0.3520192,-0.21394457,-0.5918975,0.5989913,0.09035264,0.20411536,-0.22351278,-0.021091577,0.80031157,0.13409688,0.4994685,-0.32128036,-0.9656558,-0.09618732,0.43858522,0.11732895,-0.5081916,-0.8341885,-0.93127316,-0.37937704,0.9790191,-0.4555328,0.24399737,0.5464928,0.5780119,0.94112873,0.10616773,0.14053985,-0.4891416,0.5218806,-0.46890074,0.9024137,0.00754647,0.55931014,-0.92085165,0.4984474,-0.68147224,0.82371867,-0.70602703,0.79524285,0.33791932,0.80347794,0.47475076,0.87878484,0.22688408,-0.15053773,-0.42630798,-0.27291834,-0.38467804,0.512376,0.12891248,-0.19678803,-0.78269744,0.42662424,0.48651746,0.22109021,-0.07533351,0.98382115,0.85851467,0.982079,0.24731196,0.91400707,-0.296081,-0.97885257,-0.26246214,0.7708418,-0.38508868,0.43263033,-0.9860399,0.07602364,0.36545494,-0.8284139,-0.337868,-0.4067278,-0.94281983,0.40181565,-0.6517476,-0.30443126,0.5038335,-0.55496913,0.75142264,0.73205256,0.5872195,-0.078789145,-0.54926217,-0.5460535,0.37870568,0.75495875,-0.8515796,0.36278376,-0.8141647,-0.055821717,-0.5497593,-0.17434259,-0.44066092,-0.38529983,0.46894807,-0.77034616,-0.010884553,-0.17734139,-0.7025576,0.8625929,0.97853523,0.67236894,0.09502617,0.5179876,-0.6908082,0.8438661,0.04816587,0.1378367,-0.37070554,0.37971032,0.05776868,-0.8925838,-0.11346627,-0.5240962,0.34480736,-0.47013882,-0.7376099,-0.1961782,-0.8099205,-0.046002384,-0.7412142,-0.6960176,-0.7735288,0.7111397,-0.8092719,-0.8799611,-0.9726927,0.7543771,0.88615656,0.6641163,-0.13347976,-0.006437118,0.5237326,-0.42103767,0.075104,0.97899324,-0.96086013,-0.39368993,0.55317485,0.10614348,0.2270288,0.4905013,-0.85089725,0.1223717,0.5097781,0.6425022,-0.8623898,0.2245923,-0.8138393,0.035724178,0.026247993,-0.70534915,-0.3361137,0.33508036,-0.36017355,0.3278552,-0.482292,-0.4916235,0.7331149,0.017374067,0.6747335,0.48219794,0.99064845,-0.26422235,0.869324,0.046493102,-0.47214863,0.8198193,-0.80811363,0.11937153,0.8844789,-0.83439386,0.24426115,-0.32689694,-0.7562018,0.33009574,-0.66744196,0.642803,0.29168615,-0.4559676,0.70850307,0.2528358,-0.86360824,-0.682366,-0.28352967,-0.7768525,-0.02233476,-0.76405823,0.7400102,0.97081834,0.12730949,0.81849444,-0.88679206,-0.58476835,-0.9178824,-0.5886445,-0.46661723,0.025135983,0.6798749,-0.3885989,0.01251676,0.5696626,-0.39119077,0.8687929,0.97614557,0.16445386,-0.37336582,0.9661744,-0.33566785,0.61830175,0.54611975,-0.44826072,0.6295875,0.06747058,-0.30542755,-0.8664873,0.024572799,-0.4042137,0.20080717,0.3325957,-0.023113417,0.925541,-0.87572587,0.4917882,0.035144377,-0.9337335,0.4268523,0.6144005,0.6343996,-0.6849832,0.47550112,-0.4579189,-0.46188074,0.24428645,0.7706998,0.35003158,-0.31355664,-0.94884944,0.6296543,-0.86408,-0.7366972,-0.95800227,0.40567723,0.37376407,0.48949066,0.58001703,-0.32372352,0.14513876,-0.16342361,0.78092146,0.52509695,-0.79714054,-0.70529175,-0.6869006,-0.9040189,-0.9853973,0.03374494,-0.19572762,-0.74752,0.1448092,-0.39342642,-0.11531527,0.24772826,-0.97593164,-0.13343073,-0.16262865,0.20230332,-0.37622386,0.36844838,0.6110886,0.011922092,0.45992017,-0.07823031,-0.25516543,-0.7781331,0.86670583,0.9659867,0.7604296,-0.7174837,0.1268831,-0.9137278,-0.1028197,-0.13454674,-0.93391895,-0.67660826,0.8541462,-0.08929165,0.830217,0.24098825,0.6575073,-0.8187949,-0.37112412,-0.40382004,0.20800078,-0.907564,-0.14088583,0.5353314,-0.75798374,0.071412876,0.18530679,0.37987295,0.35934007,-0.5605127,0.54597265,0.073624484,-0.36312148,-0.3095733,-0.40970415,0.31431645,0.87044144,-0.8183724,-0.032591697,-0.22563027,0.8121767,-0.51314145,-0.86573154,0.4959933,-0.8170083,-0.09683613,-0.9760071,0.115623236,-0.92239916,0.8699986,0.1587442,-0.57775134,0.70064247,-0.42733583,-0.89390886,-0.8194229,0.37531176,0.54970634,-0.0009140878,-0.27078035,-0.53152347,0.236233,0.9950841,-0.96629155,0.21770677,-0.8925575,0.63387066,-0.46541128,-0.9234928,0.39815927,-0.60004795,-0.8787755,0.089775495,-0.85475075,0.8909892,-0.42642412,0.7015029,0.8008779,-0.5251937,0.8790284,0.49219713,-0.15983965,0.7583614,0.048941147,-0.3347482,-0.3549465,-0.66618866,-0.3159518,0.67863697,0.082257755,0.7781498,-0.9790219,-0.5671175,0.14732853,0.86151344,-0.5442392,-0.051234085,0.21937391,0.38993272,0.8141691,-0.77089375,0.96881175,-0.22176564,-0.2996245,0.7189956,0.62726885,-0.37710828,0.736003,0.45557287,0.17988609,0.18224138,0.45727342,0.60425067,0.8180574,-0.038572937,0.33628923,0.8154648,-0.12722464,-0.2888427,0.7169697,-0.81276834,0.74670625,-0.16361937,0.97633344,0.6210497,0.22795121,-0.103554696,-0.68462783,0.32000494,0.41466504,0.7672677,0.879538,0.35442227,-0.06512352,0.7077482,0.54924,0.6388764,-0.46276513,0.12568402,0.85578877,0.71291107,0.078861415,-0.6840774,0.008692536,-0.54713,-0.2626031,-0.73094934,-0.9595238,-0.8579554,-0.05842127,-0.87985575,-0.14323184,0.46343753,-0.1803785,-0.9596992,0.74384755,0.03913054,0.20230764,-0.41824022,-0.083220564,-0.7789342,0.7754725,0.7800448,0.375508,-0.6554557,-0.9313191,0.06518738,-0.66864115,-0.30758047,-0.7018656,0.7291421,-0.34197983,0.23266937,-0.5344484,-0.543733,0.65350574,0.66671354,-0.24519601,-0.8789833,-0.73068494,-0.49457255,-0.27692717,0.065272234,0.90986687,0.25442764,-0.08414957,0.8295024,0.13016821,0.9426886,0.91844213,-0.2111286,0.030739563,-0.78833055,0.75279677,0.86310816,-0.43188828,0.90661794,-0.047924098,0.9503962,-0.5460835,-0.71501684,-0.30034012,-0.7216508,-0.36634037,0.65139145,-0.24059513,0.6218244,-0.72784317,0.09672145,0.13949595,0.31621164,-0.9691815,-0.21205,-0.8199903,-0.47795123,-0.2141759,0.28366172,-0.15999253,-0.47533643,0.48228207,0.11060701,0.3621911,0.11206047,-0.9927642,-0.26955917,-0.17690177,0.5576937,-0.80476266,-0.38575467,0.7797846,-0.1029723,-0.7260838,-0.972295,-0.76577777,0.10984172,0.15022445,0.95654726,-0.88372576,0.87559414,0.064785354,-0.2213206,0.39460596,0.8100849,0.36822176,-0.64636266,0.36712268,-0.47764188,-0.5065661,-0.9648291,0.5874727,0.5869341,0.66288775,-0.32255358,0.8016232,-0.024482537,0.35260397,0.5457039,0.3665716,0.7575215,-0.9938523,0.36583692,-0.79771835,-0.94782573,-0.9025972,-0.8187649,-0.57394975,0.24125642,-0.51489913,-0.77595717,-0.5696218,-0.8944337,0.35582343,0.4276816,-0.009631613,0.33410582,0.1539231,-0.18134682,-0.38397294,0.80830044,0.4765108,-0.401041,-0.01908313,0.3391234,-0.506722,0.94845307,0.45668972,0.3097379,-0.1342112,0.7919226,0.65006024,-0.6277962,0.44704753,-0.95547163,0.17118125,-0.3391474,0.924238,-0.7994171,-0.9499738,0.8485627,0.69363505,-0.12394255,-0.64090645,0.26366305,0.7950586,0.598621,0.7346089,0.17140996,-0.63784826,0.25610235,0.36411884,-0.8851135,0.59135735,-0.3353592,-0.12535407,0.9768066,-0.52229077,-0.014260115,0.97161955,-0.3238211,-0.2854638,0.14103618,-0.80762035,-0.18030336,-0.31538436,0.16338103,0.4474579,0.1354844,-0.7331226,0.9420827,-0.5391431,0.9028247,0.38077652,-0.8247399,-0.099164285,0.7448768,-0.06740359,-0.38496026,-0.09563214]	2026-05-20 07:06:08.222	2026-05-21 08:15:19.386	f	\N	t
85edf011-cdf4-4c3d-a079-e16cea300cca	Dell Precision 17 7760 (2021)	dell-precision-17-7760-2021-e6lpdo	CPU: Intel Core Processor i7-11850H (8 Core, 24MB Cache, 2.50GHz to 4.80GHz, 45W, vPro)\nRam: 32GB, DDR4, 3200MHz, Non-ECC, SODIMM\nỔ cứng: 512GB, Gen 3 PCIe x4 NVMe, Solid State Drive\nMàn hình: 17.3" IPS FHD, 1920x1080, 60Hz, Anti-Glare, Non-Touch, 100% DCIP3, 500 Nits, IR Cam/Mic, WLAN\nCard đồ họa: NVIDIA RTX A3000 w/6 GB GDDR6\nTình trạng: Hàng Like New, Nhập Khẩu\nBảo hành: 1 tháng	6cf378c7-d41b-4279-aa96-a19d98111de8	\N	2026-05-21 09:09:00.755	2026-05-21 09:09:56.05	f	\N	t
600a9046-2e76-4070-bb44-3f8042af6c44	BẾP TỪ ĐÔI KAFF KF-NK379II	bep-tu-doi-kaff-kf-nk379ii-ty5uck	Bếp 2 từ\nBảo hành 5 năm chính hãng\nMặt kính Made In Germany Index siêu bền, chịu lực, chịu sốc nhiệt 1000°C, bo viền hợp kim nhôm cao cấp chống va đập bảo vệ kính\nĐầu đốt EGO Made in Germany thế hệ mới G5 siêu bền và tiết kiệm điện\nBo mạch IGBT SIEMENS Made in Germany\nBàn phím điều khiển cảm ứng dạng trượt Slider, 9 dải công suất + Booster\nTự động chia sẻ công suất (Power management) cho các vùng nấu khác nhau\nChức năng tự động tắt bếp khi để quên và khi không có nồi\nCông nghệ biến tần Inverter tiết kiệm 40% điện năng\nChức năng Booster cực nhanh\nChức năng hẹn giờ, khóa trẻ em thông minh, tiện dụng\nChức năng tự nhận diện vùng nấu tiện dụng với các nồi lớn nhỏ\nChức năng Inverter và chia sẻ công suất giúp tiết kiệm điện năng, bảo vệ bếp\nChức năng Chiên rán\nChức năng Nấu cơm\nChức năng Hâm nóng (Keep Warm)\nChức năng Tạm dừng (Pause)\nChức năng cảm ứng chống tràn\nChức năng cảm ứng quá nhiệt\nCông suất bếp: 2000W x 2000W (Booster 2800W x 2800W)\nKích thước mặt kính: 730 x 430 mm\nKích thước khoét đá: 680 x 390 mm	fd492d86-0039-4caa-9520-ae6b47f42b0c	\N	2026-05-21 09:46:57.505	2026-05-21 09:46:57.505	f	\N	t
e84a6278-a906-4b6d-8d7d-05a919923b37	OPPO Reno15 F 5G (8GB+256GB) Xanh Nhạt	incredible-bamboo-car-2yq-yQ2GSV	Kích thước màn hình: 6.57 inch\nRAM: 8 GB; ROM: 256 GB\nMạng di động: Hỗ trợ 5G\nDung lượng pin: 7000 mAh	b7079621-c838-4e4a-a725-7750e2e31c5e	[-0.6208655,0.52462745,-0.8482313,0.1761213,0.36811212,0.07273619,-0.83320564,0.8340832,0.71959144,0.46345365,-0.87151396,-0.10748509,0.1987338,-0.9024813,-0.9370824,0.9315467,0.15061198,-0.34656614,-0.2100676,-0.6803644,0.40931034,0.3401175,-0.33771724,-0.47873074,-0.46544686,-0.72218865,-0.06652759,-0.74733055,-0.7323853,-0.95849466,0.4586896,-0.7973774,0.2187956,0.62414914,-0.54190505,-0.94032574,-0.6545057,0.6804559,0.9691999,-0.27033412,0.8252116,0.28920296,0.5635065,0.36637467,-0.46140167,0.762805,0.4914215,-0.33532023,0.877512,-0.4556637,0.16243222,0.4893268,-0.42323938,0.014657847,-0.34647068,0.45171675,-0.90900636,-0.11975294,0.03042411,-0.3544453,0.10581574,0.2177239,-0.4350209,0.8393229,0.30241895,0.4489975,0.9688935,-0.6911346,0.2665776,-0.7967292,-0.68223965,0.77147645,0.614527,-0.48995414,0.8283254,0.4423721,-0.946932,-0.43841934,-0.76156944,-0.3256216,-0.77153534,0.65247166,0.9446464,-0.28588498,0.7293643,-0.27244976,-0.27469972,-0.970942,0.5844809,0.050433233,0.950391,-0.3486924,-0.34652805,-0.6098308,0.9757143,-0.72201633,0.6168499,-0.48218235,0.30746225,0.07844101,0.85480374,0.07619952,-0.87936866,0.9635297,0.50286776,0.46849883,-0.78363335,0.062294044,-0.05091193,0.7074171,0.5511006,-0.70175475,-0.25299698,-0.66870016,-0.72315973,-0.97455645,0.8851463,-0.0456556,-0.74082404,0.30730438,0.39828187,-0.22482575,0.88074213,-0.34240943,0.3230176,-0.07906472,-0.08162049,0.91895115,0.7583171,0.1393379,-0.62324256,-0.07527355,-0.05547422,0.3620123,-0.047744825,0.6881592,-0.53298867,0.7224017,0.47442517,-0.5947153,0.3713782,-0.55796486,-0.37223536,0.2367873,-0.71608925,0.35429242,-0.1317065,-0.43722713,0.30428088,-0.69573146,0.21091774,-0.26935294,-0.011447018,-0.39953128,-0.54029965,0.94323194,-0.29211697,-0.86547,-0.9168584,0.1374029,-0.42089346,-0.36494124,-0.54092973,-0.9175843,0.8876919,0.096811645,-0.20046064,-0.80879545,0.30259773,-0.20587686,0.86256653,-0.48759204,0.90521914,-0.6030036,0.36881527,0.15182664,0.63533187,-0.2764413,-0.5034154,-0.837685,-0.04724447,0.7275452,0.41714862,-0.32190984,-0.05158219,0.10907951,-0.6336687,-0.8134871,-0.21993604,-0.5649695,0.2571492,-0.8052895,0.70803463,-0.3360215,0.20680358,-0.18385491,-0.5073772,-0.63412726,0.40832296,-0.3483277,-0.35191518,0.9887521,-0.523569,-0.30848202,0.059234593,-0.8292406,0.40323356,0.079513356,-0.38828957,-0.6790972,0.81099474,-0.6840694,-0.86352307,-0.7539105,-0.81932783,0.56456655,-0.9743727,-0.07460171,-0.16290161,0.6128742,0.71838295,-0.6096696,0.6895898,-0.29930812,-0.9414538,-0.8675601,-0.25099152,0.32124707,0.05133663,-0.30678046,-0.8703578,0.31915137,-0.03619152,0.548635,-0.50777113,0.72516066,-0.065918304,-0.52396595,-0.3956113,-0.42383212,-0.8789747,0.1360571,-0.20908737,0.44774824,0.66175485,0.5830154,-0.76671743,-0.32974923,0.7516796,0.57005036,-0.47045842,0.68969876,-0.26066,0.89424646,-0.8153496,0.017954012,0.9609188,0.7788669,-0.9372072,0.29848439,0.928814,-0.39015433,0.03196865,0.8886464,0.4195847,-0.34844753,0.0640987,0.4372433,-0.12309067,0.34151182,0.2687794,0.54098195,0.2509603,0.49452373,0.2873034,-0.6988649,0.14795925,-0.5163621,-0.8222707,0.84089106,0.67680055,0.15623586,-0.715618,-0.14373806,-0.3113937,-0.29636207,-0.91653514,0.887916,-0.3388382,0.17994098,0.38322413,0.37030232,-0.88689303,-0.92927676,-0.7625592,-0.580352,0.6969421,0.6144565,0.18426478,-0.87247986,-0.4608093,-0.25872064,-0.6389484,-0.89959943,0.030567558,0.55729014,0.29942724,-0.91893065,-0.71787894,-0.46918693,-0.7202713,0.7748133,-0.24500689,-0.4647141,-0.004455958,0.69885826,0.8643239,0.3027002,0.84171057,0.91857487,-0.7327332,0.10944589,-0.3358798,-0.90254694,-0.8273265,0.4018418,-0.8194545,0.24076349,-0.6044639,-0.09283308,0.27423498,-0.17871243,0.30715045,-0.7446997,-0.75103414,-0.15989082,0.15775916,-0.25105867,-0.18121347,-0.12990871,-0.09719504,0.46688357,-0.03501184,-0.71948504,-0.5670675,-0.12415614,-0.19924328,0.5884442,-0.39172986,-0.16145588,0.6781316,0.18950894,-0.85003155,-0.4901629,0.13152045,-0.48708948,0.37143815,0.08804283,0.9440822,0.17823717,0.03506873,-0.21498145,-0.3168593,0.7436836,-0.16605714,0.29141548,-0.6413474,-0.15756944,0.9006168,-0.37972525,-0.6127664,-0.043703552,-0.86403054,-0.79781973,0.6830098,-0.80848294,-0.006373479,0.13594793,-0.33924323,0.6763861,-0.75430334,-0.97273093,-0.297714,0.7260478,0.3483272,-0.051804774,0.7940996,0.38164952,-0.4510753,0.8342705,-0.060437243,0.3367272,0.85635,-0.26864597,0.1041587,-0.50436187,-0.87880427,0.9815187,0.83799005,-0.2734818,0.8578175,-0.79577285,-0.6502443,-0.7729389,-0.12213749,-0.08160064,0.61044234,0.39145422,-0.5611538,0.8548039,-0.57897115,0.44267282,-0.5888887,0.8085283,-0.5087805,0.21059829,-0.4374967,-0.34524143,-0.063918486,0.90405935,-0.19807866,0.037829414,0.7592747,0.11650512,0.49189636,0.012344049,-0.9932112,-0.5495537,0.99729675,-0.23946676,0.8550991,-0.12377429,0.13328172,-0.48822603,0.36875713,-0.9454088,-0.10126714,-0.6145529,0.62594616,-0.25720888,0.18046382,-0.6945965,0.30593446,0.6773115,-0.69381446,-0.7096861,0.5065732,0.67937434,-0.26002067,-0.96742904,-0.03915474,-0.18911096,-0.3147096,-0.34487835,-0.3001925,0.1952082,0.3289915,0.73133206,-0.6518752,-0.015584097,-0.86922425,-0.17891312,-0.17407154,0.4038207,0.6668017,0.51454705,0.15226138,-0.9846577,-0.14028811,0.405328,-0.84819657,0.824369,0.8238082,-0.058772452,-0.48572853,0.74553084,0.0074007795,-0.8415143,-0.2432983,-0.1152296,-0.42067972,0.91932386,-0.15581493,-0.84015024,0.33919093,0.9087344,0.50702274,-0.22055762,0.1991499,-0.27306303,0.62575173,0.18052605,-0.38777614,0.64662075,-0.9894589,0.24461706,-0.28662735,0.95624834,-0.573135,-0.11989027,-0.52292216,-0.019283488,-0.64446366,-0.122811764,0.6502415,-0.7085215,0.7120822,-0.9042301,0.08312878,0.73697454,-0.7161774,-0.5255207,0.13341154,-0.2318645,-0.21387349,0.82681584,0.91086376,-0.29292768,-0.077246465,-0.14980167,0.78921723,0.56227905,0.55362177,-0.46331733,-0.92666495,0.49946952,-0.5460566,0.26937845,-0.17153884,-0.09297806,-0.46584335,-0.878895,0.09083718,0.15253545,0.89638424,-0.8728589,-0.21220005,-0.5016212,-0.8811137,-0.95103043,0.94993424,-0.0912522,-0.20731737,-0.84915805,0.64819926,0.42379558,-0.8158072,0.44654515,-0.42767313,-0.08824121,-0.459113,0.8847098,-0.30266526,0.5455297,0.2021532,0.007119623,0.5041327,0.41530776,-0.5482592,0.07088638,0.11420518,-0.6608445,0.7101575,0.9378221,0.10186641,-0.40439862,0.029486002,-0.13592276,0.8872194,0.31962925,-0.76913303,-0.4747231,-0.4296038,0.09758151,-0.95482296,-0.17220289,-0.039688565,0.2799477,-0.2607757,0.7111247,-0.21324518,-0.6463455,0.0766806,0.4527016,0.9336321,-0.42543745,-0.87166506,0.52255833,-0.39279208,-0.94690645,-0.5181602,-0.06377332,0.67082417,-0.11147337,-0.13110141,0.58176225,0.4126511,0.39395016,0.72236866,-0.8707191,-0.43044984,-0.2814529,0.6829104,0.7712079,0.18054834,-0.3825969,-0.108442865,0.50960803,0.39314413,-0.23843549,0.64783406,-0.970295,-0.5059669,0.9126205,0.31692967,-0.7828209,-0.2514222,0.32147452,-0.2422689,0.1776813,-0.6259697,-0.82479864,0.81957287,0.7325776,-0.25045958,0.33908752,0.8683944,0.98484296,-0.27206463,-0.6969124,-0.38164562,-0.5718164,0.47527808,0.056125414,0.48332226,0.36068,-0.08574619,-0.2163325,-0.09832728,0.6150597,-0.591776,-0.31111988,-0.9824749,0.7349993,-0.6343255,0.2973357,0.43307787,0.939832,0.9171092,0.26884094,-0.18464535,-0.7008903,-0.6247109,-0.36270946,0.6485085,0.2174168,-0.5583359,0.73957956,-0.30376512,0.7881907,-0.21078971,0.319634,-0.04552061,-0.83492357,0.9982816,0.17147362,-0.5670466,-0.04720095,0.340219,-0.77102596,0.16951635,0.11217738,-0.0493485,0.053671703,0.83666086,0.13835573,0.027654642,0.2141303,0.7900884,-0.1113653,-0.15296173,-0.3771328,0.0007437801,-0.37009773,0.31133735,0.93070674,0.68639433,0.83051103,-0.7429321,-0.5434668,-0.8745661,-0.9342107,0.14876832,0.2872575,0.6361475,-0.80396235,0.7735413,0.22316656,0.8189789,0.40764493,0.22503775,0.6483948,-0.3948414,-0.34110355,-0.40774384,0.37933198,-0.9660406,0.9141777,-0.72498804,-0.47779045,-0.5282573,-0.82545245,-0.13996285,0.9151355,0.5545023,0.3473951,0.9568454,0.9703955,-0.41561168,0.23325805,0.8024772,-0.7237515,0.7261298,0.12676917,0.7929439,0.8106965,-0.37009516,-0.8817404,0.79969066,-0.7486134,0.68931127,0.09667718,-0.057346303,0.96656036,-0.23157123,-0.64758545,-0.41302776,0.30884808,0.8233454,0.7636644,0.61697096,-0.70729303,-0.5302015,0.36381716,-0.63673955,0.30536917,-0.63619524,-0.0117244795,0.40730545,-0.68253946,-0.502199,0.31833214,0.49219278,0.008931301,-0.08112281,0.2502397,0.3848394,0.27341813,-0.55659574,0.7314735,0.20104015,-0.656767,-0.83554846,-0.21859255,0.1277642,0.24661146,0.93506473,-0.022385515]	2026-05-20 07:06:07.14	2026-05-21 09:48:09.252	f	\N	t
2dcc7110-b084-4b84-84de-d5e84bc7d430	Giày thể thao Daddy Giày nữ	giay-the-thao-daddy-giay-nu-i47gsd	Phân loại màu: Xám / Trắng\nChất liệu: Polyeste cao cấp\nKiểu dáng: Giày thể thao cao 4.5cm , tone màu trắng - xám , thoáng khí , êm chân\nĐảm bảo chất lượng, form dáng thiết kế hợp thời trang	0ecddf00-9df1-4fa3-952e-960cd640ff5f	\N	2026-05-21 12:02:51.33	2026-05-21 12:02:51.33	f	\N	t
\.


--
-- Data for Name: ProductAttribute; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."ProductAttribute" (id, "productId", key, value, unit) FROM stdin;
1b463ae8-5931-4954-bf57-30c25957f2ae	e84a6278-a906-4b6d-8d7d-05a919923b37	screen_size	6.7	inch
ec872957-a97c-4100-9a8d-1b342420d06c	e84a6278-a906-4b6d-8d7d-05a919923b37	ram	16	GB
e3ebc193-efd0-4d9e-b909-bc618bf38b0a	e84a6278-a906-4b6d-8d7d-05a919923b37	storage	64	GB
50372ce4-c8f0-41f0-b548-f73cb5b605e1	e84a6278-a906-4b6d-8d7d-05a919923b37	battery	5000	mAh
043c5e44-f44b-41ad-aae4-5dcf64884486	e84a6278-a906-4b6d-8d7d-05a919923b37	camera	50	MP
0ad121be-4c53-4081-bacc-bdf7bb92175e	9b080ce0-dff0-4166-adfa-34e9eed7339a	screen_size	6.9	inch
bae85854-6b48-4610-ab2c-3b19e22a26c1	9b080ce0-dff0-4166-adfa-34e9eed7339a	ram	6	GB
8df116d6-0f81-4962-8dad-b858e994390d	9b080ce0-dff0-4166-adfa-34e9eed7339a	storage	128	GB
8f1b9028-6491-406c-85d6-4e4b01398626	9b080ce0-dff0-4166-adfa-34e9eed7339a	battery	4000	mAh
23da1095-a976-4e31-b6d7-a0a84425558f	9b080ce0-dff0-4166-adfa-34e9eed7339a	camera	12	MP
2693e8ff-4086-434f-87be-fbeed4408844	2eca6f19-46e9-4d2c-9fe5-af77803038d9	screen_size	6.7	inch
54e5c486-810d-4042-9fef-c7737f227fd1	2eca6f19-46e9-4d2c-9fe5-af77803038d9	ram	12	GB
832f5718-7e8a-4e3f-98aa-9089bd2aca66	2eca6f19-46e9-4d2c-9fe5-af77803038d9	storage	512	GB
52b3efd4-a83a-4fe3-b53c-b953bb9c9645	2eca6f19-46e9-4d2c-9fe5-af77803038d9	battery	5000	mAh
195d9eb5-a65a-4349-94cb-bbd6d9797ebf	2eca6f19-46e9-4d2c-9fe5-af77803038d9	camera	64	MP
45af7ead-dda0-4d22-aba9-ef96fe4dbc72	6a1989ce-70c3-475e-94c3-c276d7853dc3	screen_size	6.7	inch
485abd56-6cf9-43a2-9398-bf90cb7dcdb3	6a1989ce-70c3-475e-94c3-c276d7853dc3	ram	6	GB
b734180d-72f6-463a-84a6-46cb25948051	6a1989ce-70c3-475e-94c3-c276d7853dc3	storage	64	GB
7af5aba1-7188-40cf-9191-4629fd42cca8	6a1989ce-70c3-475e-94c3-c276d7853dc3	battery	5500	mAh
4d4ca014-ae35-4690-a158-7bac81245c78	6a1989ce-70c3-475e-94c3-c276d7853dc3	camera	108	MP
efd38a06-9194-4543-a766-9350609f7422	26e5e622-39e9-4b92-8695-5844dfa9b2fe	screen_size	6.9	inch
00fd81ce-e4bd-4f00-bc24-1c38e074ee8e	26e5e622-39e9-4b92-8695-5844dfa9b2fe	ram	8	GB
4ebe210d-d746-4559-a9da-dca196719969	26e5e622-39e9-4b92-8695-5844dfa9b2fe	storage	512	GB
2af257ee-a13c-495a-b80a-542adb5d85ab	26e5e622-39e9-4b92-8695-5844dfa9b2fe	battery	5500	mAh
40d85a73-fbea-490d-a9a5-b32b83e30e48	26e5e622-39e9-4b92-8695-5844dfa9b2fe	camera	64	MP
e973dcec-d524-4f81-be65-f5a03c7fa110	9abc6cdf-d54b-4b24-9ccf-832628adeeff	screen_size	6.1	inch
dd424eaa-986e-468a-bd02-fffd1cee288c	9abc6cdf-d54b-4b24-9ccf-832628adeeff	ram	4	GB
fff1ce3e-0b56-4470-b847-0ab6af0e9622	9abc6cdf-d54b-4b24-9ccf-832628adeeff	storage	128	GB
6a2cd8f9-1545-4957-9c87-8827b6d2a9fa	9abc6cdf-d54b-4b24-9ccf-832628adeeff	battery	4000	mAh
373de062-d27a-44f7-8926-ddc60624077b	9abc6cdf-d54b-4b24-9ccf-832628adeeff	camera	64	MP
b3c9cce7-6028-4654-8d5a-19fbf8d684a0	0edd5422-68eb-4e94-9030-b9a67afea7dd	screen_size	11	inch
3b58231f-7615-47b5-8203-658e984a05f4	0edd5422-68eb-4e94-9030-b9a67afea7dd	ram	6	GB
a8f4e1c6-7a78-4a34-9c74-aba6dc5cb031	0edd5422-68eb-4e94-9030-b9a67afea7dd	storage	256	GB
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."ProductImage" (id, "productId", url, "isPrimary", "imageEmbedding") FROM stdin;
ebf80f7a-7894-4cb2-9571-bedbcf120671	9abc6cdf-d54b-4b24-9ccf-832628adeeff	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351321/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff/ru300jzqdwgksto7itcq.webp	f	\N
834bcc4f-e3ab-4f10-ad69-9ea57dadbe0b	9abc6cdf-d54b-4b24-9ccf-832628adeeff	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351321/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff/uqsp76fohnycmzf7rcqd.webp	f	\N
9e2924a4-5aba-46ec-9b40-9b3931bf9614	9abc6cdf-d54b-4b24-9ccf-832628adeeff	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351322/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff/g8rxactx9o1xafxidnbl.webp	f	\N
ab8ba0d0-eaa1-41b3-9b2b-08b97d13c3f5	9abc6cdf-d54b-4b24-9ccf-832628adeeff	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351321/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff/ynzhrc0obxwij7zk96yo.webp	f	\N
9c75a141-a1ff-431c-88c6-43fa03f07285	9abc6cdf-d54b-4b24-9ccf-832628adeeff	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351321/products/9abc6cdf-d54b-4b24-9ccf-832628adeeff/oxpqxi4sjrdmogdfbrd7.webp	f	\N
6388a408-fba6-43ca-9ea4-27e084d80376	26e5e622-39e9-4b92-8695-5844dfa9b2fe	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351335/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe/wcblp7rqjj5yj4hk1qhj.jpg	f	\N
b58c7d4c-331a-4db1-b556-c03d4ae726f8	26e5e622-39e9-4b92-8695-5844dfa9b2fe	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351335/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe/amsdcdofl5oeesqgmj8r.jpg	f	\N
e7d8d776-3321-4326-ac34-db05f1042f7a	26e5e622-39e9-4b92-8695-5844dfa9b2fe	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351335/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe/us6spwopqooditwe5z3m.jpg	f	\N
d9bfc506-d17f-467a-98bb-a06f9f0b4511	26e5e622-39e9-4b92-8695-5844dfa9b2fe	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351334/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe/xltbxaany7tvqy90mm9a.jpg	f	\N
8916e912-0a18-4d7f-b430-aef25547cc6a	26e5e622-39e9-4b92-8695-5844dfa9b2fe	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351334/products/26e5e622-39e9-4b92-8695-5844dfa9b2fe/yezf3nsuiuahancysl6q.jpg	f	\N
a26099f5-cc09-40d3-8d12-1cfec5b4856f	6a1989ce-70c3-475e-94c3-c276d7853dc3	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351482/products/6a1989ce-70c3-475e-94c3-c276d7853dc3/nnnnu6bko29jzymxhblh.webp	f	\N
ebbeb844-0966-41b3-becc-640841a866ce	6a1989ce-70c3-475e-94c3-c276d7853dc3	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351483/products/6a1989ce-70c3-475e-94c3-c276d7853dc3/hlmr58xsuafldmmtf9mk.webp	f	\N
3a1cea27-7663-4229-a116-cb77c91e9094	6a1989ce-70c3-475e-94c3-c276d7853dc3	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351483/products/6a1989ce-70c3-475e-94c3-c276d7853dc3/tr7jo0efkd4edsrcjn8l.webp	f	\N
93bc08df-ceea-4a5e-a097-c4f5ea1c44dd	6a1989ce-70c3-475e-94c3-c276d7853dc3	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351482/products/6a1989ce-70c3-475e-94c3-c276d7853dc3/kht5jypdmoff5n6ntucf.webp	f	\N
c264e323-12af-4dff-ab39-a3a782f05ec2	6a1989ce-70c3-475e-94c3-c276d7853dc3	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351482/products/6a1989ce-70c3-475e-94c3-c276d7853dc3/lf7ha8smzznsjy910mwf.webp	f	\N
b8aad5f5-c4bf-4949-a29b-8a65df4daa1f	2eca6f19-46e9-4d2c-9fe5-af77803038d9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351587/products/2eca6f19-46e9-4d2c-9fe5-af77803038d9/uaf2gcnw69dhovlmfrsa.webp	f	\N
118ee10c-9446-419d-baa6-d38e9f054255	2eca6f19-46e9-4d2c-9fe5-af77803038d9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351587/products/2eca6f19-46e9-4d2c-9fe5-af77803038d9/g8s7z6aoy4zgaj31nrlq.webp	f	\N
2a644028-8cda-43a8-bf29-2f6ff419ca86	2eca6f19-46e9-4d2c-9fe5-af77803038d9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351587/products/2eca6f19-46e9-4d2c-9fe5-af77803038d9/mvqnjkerqzgdb9yrynvv.webp	f	\N
e30e1529-6bb1-490f-ae34-2c027b3b77a0	2eca6f19-46e9-4d2c-9fe5-af77803038d9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351587/products/2eca6f19-46e9-4d2c-9fe5-af77803038d9/u5vt3gugjdu3y6bccrop.webp	f	\N
12a7c37f-181b-4b14-b864-c6f4c84aaedf	2eca6f19-46e9-4d2c-9fe5-af77803038d9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351587/products/2eca6f19-46e9-4d2c-9fe5-af77803038d9/yllylnmy83uyrxbsgyns.avif	f	\N
ce4e569c-19da-4917-916d-bb7feef82ce9	9b080ce0-dff0-4166-adfa-34e9eed7339a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351668/products/9b080ce0-dff0-4166-adfa-34e9eed7339a/pbjy6hvaetm2sj7lerzh.webp	f	\N
e92b829e-3817-4a39-97e0-1c62df19b660	9b080ce0-dff0-4166-adfa-34e9eed7339a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351668/products/9b080ce0-dff0-4166-adfa-34e9eed7339a/rcvaqjtpu27mbyoglhvf.webp	f	\N
2898854e-f3fb-4292-a49c-ce92a3fee0ee	9b080ce0-dff0-4166-adfa-34e9eed7339a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351668/products/9b080ce0-dff0-4166-adfa-34e9eed7339a/xqsu30ddv6ywx9lfqzqr.webp	f	\N
68dd4576-3437-4a53-b532-46ee6414fdcb	9b080ce0-dff0-4166-adfa-34e9eed7339a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351668/products/9b080ce0-dff0-4166-adfa-34e9eed7339a/fafolglid3oflukphy4w.webp	f	\N
fbafa142-c67e-46e7-b144-87f76045b829	9b080ce0-dff0-4166-adfa-34e9eed7339a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779351671/products/9b080ce0-dff0-4166-adfa-34e9eed7339a/myxr8wn03hkepldcjufr.jpg	f	\N
61023dbe-1317-4958-9aa3-f3986274d032	49189589-4122-41b9-9f55-2cd9954d0141	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353166/products/49189589-4122-41b9-9f55-2cd9954d0141/qpzd7qymwsmvjv1eepao.png	f	\N
b8d4eb9b-1f10-462d-8d7c-ca1776684df8	49189589-4122-41b9-9f55-2cd9954d0141	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353166/products/49189589-4122-41b9-9f55-2cd9954d0141/huvtvvwtmcqiloo6nyzq.png	f	\N
834fccad-c5c6-4e48-ae3a-ad91487f53f7	49189589-4122-41b9-9f55-2cd9954d0141	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353167/products/49189589-4122-41b9-9f55-2cd9954d0141/lzope7ydxono2dsfb4be.png	f	\N
e1f8b8b6-ebc7-40ed-ad15-dc9e582e8aef	49189589-4122-41b9-9f55-2cd9954d0141	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353166/products/49189589-4122-41b9-9f55-2cd9954d0141/es99ciw71bez2hhkrgcy.jpg	f	\N
64f3dbbd-c3bc-425e-8542-dcdb4377328f	49189589-4122-41b9-9f55-2cd9954d0141	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353166/products/49189589-4122-41b9-9f55-2cd9954d0141/dujdrlf4lstkfp6xynjd.jpg	f	\N
7c81457e-aa96-402a-8c4e-eaf18ce333cc	0edd5422-68eb-4e94-9030-b9a67afea7dd	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353364/products/0edd5422-68eb-4e94-9030-b9a67afea7dd/g0iswyoeuhzpk7vhyaxb.jpg	f	\N
310f22aa-1201-4a18-866f-45f13cb86b38	0edd5422-68eb-4e94-9030-b9a67afea7dd	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353364/products/0edd5422-68eb-4e94-9030-b9a67afea7dd/hu2rvefguu74nfwkmtzt.jpg	f	\N
c80a4615-d6ae-488d-8855-67220acc67a1	0edd5422-68eb-4e94-9030-b9a67afea7dd	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353365/products/0edd5422-68eb-4e94-9030-b9a67afea7dd/x18mkzvix5duqmjolxul.jpg	f	\N
ca2457a4-972a-41da-8eff-31dfed537cea	0edd5422-68eb-4e94-9030-b9a67afea7dd	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353364/products/0edd5422-68eb-4e94-9030-b9a67afea7dd/k1alkkwlkklmmihsnzce.jpg	f	\N
632263d6-83be-44fc-9f70-e705e349adad	3430a0e3-d0d7-4f21-94c2-f4e793da4d3b	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353473/products/3430a0e3-d0d7-4f21-94c2-f4e793da4d3b/spzzk3jkgcmfhhyjh83y.jpg	f	\N
6e859dd7-a214-419c-bd33-d7c89072df8c	3430a0e3-d0d7-4f21-94c2-f4e793da4d3b	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353473/products/3430a0e3-d0d7-4f21-94c2-f4e793da4d3b/jppyil98b4wd0lz3rwsg.jpg	f	\N
2f758de0-5ac5-4836-a6b3-72163c95fb8d	3430a0e3-d0d7-4f21-94c2-f4e793da4d3b	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353474/products/3430a0e3-d0d7-4f21-94c2-f4e793da4d3b/vmp6iatliqi7qpjvze3z.jpg	f	\N
aa289dfd-6463-44f0-b230-9bfcb2852f37	3430a0e3-d0d7-4f21-94c2-f4e793da4d3b	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353473/products/3430a0e3-d0d7-4f21-94c2-f4e793da4d3b/x6amobb6xrbqzsl3ivwq.jpg	f	\N
ffa0c66a-5fac-45f9-84bb-2dbc0edc7f48	3430a0e3-d0d7-4f21-94c2-f4e793da4d3b	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353474/products/3430a0e3-d0d7-4f21-94c2-f4e793da4d3b/vddvbxxojzbwrdjmqs6w.jpg	f	\N
28603e97-7dd5-4fc8-ab5c-846629ac20bc	eb7fbe43-7296-449a-aa50-8c62f5b37f40	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353544/products/eb7fbe43-7296-449a-aa50-8c62f5b37f40/syrx7w6brjqfclyy7o83.webp	f	\N
1d1938ac-b0a4-43aa-940f-784337630cb5	eb7fbe43-7296-449a-aa50-8c62f5b37f40	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353544/products/eb7fbe43-7296-449a-aa50-8c62f5b37f40/tjpc71pkz6n3ucgkgt58.webp	f	\N
1661c228-f985-418f-8e26-e81b8f40e582	eb7fbe43-7296-449a-aa50-8c62f5b37f40	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353544/products/eb7fbe43-7296-449a-aa50-8c62f5b37f40/nremdatqkbbiv96cazmx.webp	f	\N
926c4d46-0f6b-47c6-8d92-e0a685c7cb7b	eb7fbe43-7296-449a-aa50-8c62f5b37f40	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353543/products/eb7fbe43-7296-449a-aa50-8c62f5b37f40/t52asnpruwmc9lfaelid.webp	f	\N
2c38a115-ff38-41a6-a134-4ee918b5794c	eb7fbe43-7296-449a-aa50-8c62f5b37f40	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353543/products/eb7fbe43-7296-449a-aa50-8c62f5b37f40/unosjvahmydonkkfg6vq.webp	f	\N
4aa61530-f67e-402c-b4fc-fe0f503c2a2d	a4f7fd8a-a14b-4030-8136-457956dcf3d2	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353604/products/a4f7fd8a-a14b-4030-8136-457956dcf3d2/im0sen4iabfnj4ubhsj5.png	f	\N
2d79640b-f62e-4ce9-b825-15c386933aee	a4f7fd8a-a14b-4030-8136-457956dcf3d2	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353603/products/a4f7fd8a-a14b-4030-8136-457956dcf3d2/msn2iug2h87u9veymype.png	f	\N
9281a4d8-f4dc-43b4-b376-e629542d022b	c8907458-7814-46b1-b9e3-4d606b831b5c	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353650/products/c8907458-7814-46b1-b9e3-4d606b831b5c/v0gikmzreznqyedodxuo.png	f	\N
e06fb74f-4793-491c-b5c2-026dbdcfe871	c8907458-7814-46b1-b9e3-4d606b831b5c	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353650/products/c8907458-7814-46b1-b9e3-4d606b831b5c/tni1bg9junskm8u26rhd.png	f	\N
d1c84f1a-ca51-4427-8ac4-320ed747ccd9	f994ac8a-37e1-4273-81fb-74e4e7958dc2	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353691/products/f994ac8a-37e1-4273-81fb-74e4e7958dc2/sc8gwvxhvtwzvartgyvm.png	f	\N
a6a37879-8310-4f1c-8775-de32415e9291	569d040a-b54c-4594-a865-0b5aa214a8e2	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353775/products/569d040a-b54c-4594-a865-0b5aa214a8e2/em6rfisqx4nmfdbnmzn3.webp	f	\N
8ea9a17a-4f1b-43dd-a3f1-052a38802de4	569d040a-b54c-4594-a865-0b5aa214a8e2	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353775/products/569d040a-b54c-4594-a865-0b5aa214a8e2/b5nhnlgqiiwm388zfepz.webp	f	\N
c47b457c-d807-4039-b689-0106fdc46edb	d19ec357-922f-4bbe-8d68-e82bdd102434	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353849/products/d19ec357-922f-4bbe-8d68-e82bdd102434/kdjcukiaal6blji6gblp.jpg	f	\N
72060702-4a2f-471a-b754-9c2cbcae55de	d19ec357-922f-4bbe-8d68-e82bdd102434	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353849/products/d19ec357-922f-4bbe-8d68-e82bdd102434/phayymmpybdqvkpu0gps.jpg	f	\N
39e49cc6-dcf2-4d10-90b0-46962fae4cba	d19ec357-922f-4bbe-8d68-e82bdd102434	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353849/products/d19ec357-922f-4bbe-8d68-e82bdd102434/f18t5hpvcjwiulnrlpyy.webp	f	\N
83df1cf4-e7b1-4c7b-bc23-64e055481c2e	4fbf0a8e-3761-4e0c-8518-95e14d45f855	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353927/products/4fbf0a8e-3761-4e0c-8518-95e14d45f855/k8l2slboavdcshhyfghh.jpg	f	\N
01d6045a-031e-4fa1-80d5-8909eeeadfdb	4fbf0a8e-3761-4e0c-8518-95e14d45f855	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353927/products/4fbf0a8e-3761-4e0c-8518-95e14d45f855/xohm6bueiln4t0rsuzpa.jpg	f	\N
7b83bff7-e5f3-468f-b5fb-b9cccbc7d332	4fbf0a8e-3761-4e0c-8518-95e14d45f855	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353928/products/4fbf0a8e-3761-4e0c-8518-95e14d45f855/bitzu3iqujmbqsn6nuxu.jpg	f	\N
504d41c9-8133-4270-83d7-9bc642fbf292	4fbf0a8e-3761-4e0c-8518-95e14d45f855	https://res.cloudinary.com/do8svjo8h/image/upload/v1779353927/products/4fbf0a8e-3761-4e0c-8518-95e14d45f855/euws0selfertqdmecgfd.jpg	f	\N
161e1eb9-9f86-4e49-b403-99864aa1df4c	c5be2391-81bc-4112-96c7-9d6f001fa416	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354029/products/c5be2391-81bc-4112-96c7-9d6f001fa416/v8idmxiphmkvx5mkxz7g.jpg	f	\N
29bc5bef-c4de-4ddb-976e-c706537fffce	c5be2391-81bc-4112-96c7-9d6f001fa416	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354029/products/c5be2391-81bc-4112-96c7-9d6f001fa416/bdtzv3kw0vyatyyhia1o.jpg	f	\N
745e1e16-2712-46a2-b7be-b6cf467e6842	c5be2391-81bc-4112-96c7-9d6f001fa416	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354029/products/c5be2391-81bc-4112-96c7-9d6f001fa416/tobotzfakjuda5cuv0yz.jpg	f	\N
294bd74f-c99a-4c63-b64e-8d7a01c2216d	af28dfc2-91ef-4715-93a6-6e5e42b4b15d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354126/products/af28dfc2-91ef-4715-93a6-6e5e42b4b15d/lmndb3nmaj60eq1muxnj.webp	f	\N
d75ca6d0-d41a-4184-b4be-f2b37f4d2682	af28dfc2-91ef-4715-93a6-6e5e42b4b15d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354126/products/af28dfc2-91ef-4715-93a6-6e5e42b4b15d/mtshbmpzqp90lwm6acap.webp	f	\N
87241247-da70-47e3-b2df-859a68d61dd5	af28dfc2-91ef-4715-93a6-6e5e42b4b15d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354125/products/af28dfc2-91ef-4715-93a6-6e5e42b4b15d/mqvl1d0dp5fynnbdzoor.webp	f	\N
4d186c50-fb59-401b-af98-80050af14c7b	ccd909a5-fa59-4253-ae4e-1db9b104e704	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354168/products/ccd909a5-fa59-4253-ae4e-1db9b104e704/vwqfcsoamqno8kktoq7w.webp	f	\N
af2078c1-25b1-424c-8727-9dff8cd9252e	ccd909a5-fa59-4253-ae4e-1db9b104e704	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354169/products/ccd909a5-fa59-4253-ae4e-1db9b104e704/hqwxp8ejqjkcm9kygkhf.webp	f	\N
7f3359cc-0a31-475f-856b-d4934aa1d3c7	ccd909a5-fa59-4253-ae4e-1db9b104e704	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354168/products/ccd909a5-fa59-4253-ae4e-1db9b104e704/hle80cxlxds47ze5afwv.webp	f	\N
a06c8677-5276-4161-8803-693b7f34bd9d	db10b02c-58f1-402e-bcd4-d7f247ed54d5	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354233/products/db10b02c-58f1-402e-bcd4-d7f247ed54d5/v6yttxoonj030x0f5tod.webp	f	\N
f4d92840-380a-43f0-8bf6-71d7f7af68e7	db10b02c-58f1-402e-bcd4-d7f247ed54d5	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354232/products/db10b02c-58f1-402e-bcd4-d7f247ed54d5/ltagyectp87al4yfazpd.webp	f	\N
e06f4379-466a-4fd2-9580-c9cd40da8f2e	db10b02c-58f1-402e-bcd4-d7f247ed54d5	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354232/products/db10b02c-58f1-402e-bcd4-d7f247ed54d5/belnmla6xk92loc2snep.webp	f	\N
c66340e8-5d8f-4c24-8508-2d6be4030a7f	d708039f-b2a9-4868-b262-1793fb19bb25	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354345/products/d708039f-b2a9-4868-b262-1793fb19bb25/r2cdnocwbqyvgjwusy9e.jpg	f	\N
038abf4f-9675-42c4-9429-ec1590f5719b	d708039f-b2a9-4868-b262-1793fb19bb25	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354346/products/d708039f-b2a9-4868-b262-1793fb19bb25/hxqugfd9kiglnrwh8fjl.jpg	f	\N
ee006fd8-4853-4e2a-8a11-86e96959763c	d708039f-b2a9-4868-b262-1793fb19bb25	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354345/products/d708039f-b2a9-4868-b262-1793fb19bb25/mpkpmf8gln96acgsyyvd.jpg	f	\N
259d1121-e741-467f-8679-8d39839554ce	d708039f-b2a9-4868-b262-1793fb19bb25	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354346/products/d708039f-b2a9-4868-b262-1793fb19bb25/wvui0tmduhwpv5hr0ibo.jpg	f	\N
e5b98320-9524-49a6-a108-c60759390abf	d708039f-b2a9-4868-b262-1793fb19bb25	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354346/products/d708039f-b2a9-4868-b262-1793fb19bb25/ni4ivngjkzjck532tt7o.jpg	f	\N
170e9446-dfee-4286-bd6c-414e588612a5	b0fd4c30-13c4-41ee-8f5f-7a570bea23e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354454/products/b0fd4c30-13c4-41ee-8f5f-7a570bea23e6/aaomt4dw6yuaofxiumvj.webp	f	\N
6ac211e2-3f60-4ef8-8668-5998afc0b3f0	b0fd4c30-13c4-41ee-8f5f-7a570bea23e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354454/products/b0fd4c30-13c4-41ee-8f5f-7a570bea23e6/zatovomjt0nubbuxt3uh.webp	f	\N
fd9f386b-c184-4f57-a326-87594bd3646c	b0fd4c30-13c4-41ee-8f5f-7a570bea23e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354454/products/b0fd4c30-13c4-41ee-8f5f-7a570bea23e6/bzvqmnyxvjgqknwlhfxl.webp	f	\N
4bcc0b1c-cd60-4a6c-bdae-557bcb2d5a27	b0fd4c30-13c4-41ee-8f5f-7a570bea23e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354454/products/b0fd4c30-13c4-41ee-8f5f-7a570bea23e6/b5jbfz7bjbcww2uhmcid.webp	f	\N
379a3ddc-5ecd-40fb-b4ae-3426c37baec5	b0fd4c30-13c4-41ee-8f5f-7a570bea23e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354454/products/b0fd4c30-13c4-41ee-8f5f-7a570bea23e6/etw4lew0jqqkbhtzveyt.webp	f	\N
cb88f06d-5259-49b7-99f1-b13de94d6c42	85edf011-cdf4-4c3d-a079-e16cea300cca	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354598/products/85edf011-cdf4-4c3d-a079-e16cea300cca/zp3ivab4lmar0isk36t4.jpg	f	\N
3f4bd1cd-4c97-4256-a255-a3b592af064d	85edf011-cdf4-4c3d-a079-e16cea300cca	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354598/products/85edf011-cdf4-4c3d-a079-e16cea300cca/qdf1rwvp3i2sm3muwqit.jpg	f	\N
8cbde576-5dbe-44a9-8333-c8560ae4386e	24736bc5-5851-46ce-941e-5c69cbb20914	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354688/products/24736bc5-5851-46ce-941e-5c69cbb20914/tyl0rplbrjcddnycdrqo.png	f	\N
70d10229-ebb6-4912-aca2-71748fe0fac5	24736bc5-5851-46ce-941e-5c69cbb20914	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354691/products/24736bc5-5851-46ce-941e-5c69cbb20914/gs2isj3i8g5seshknvrv.png	f	\N
5d22ffa1-7255-4a47-a428-d38e162e18d7	1949fb1b-6b79-4c63-a319-4b83faa87f2d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354714/products/1949fb1b-6b79-4c63-a319-4b83faa87f2d/aqjnnfnymsyp3eyckv4p.jpg	f	\N
258f713d-f9e6-4ac1-b039-c2813d915d88	cf10d9f9-baaf-4f87-8dd6-135fcf9fb129	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354866/products/cf10d9f9-baaf-4f87-8dd6-135fcf9fb129/tgddhprm7xfl82nserfz.jpg	f	\N
5f2de851-b873-4412-8b23-eafc87c3a667	cf10d9f9-baaf-4f87-8dd6-135fcf9fb129	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354866/products/cf10d9f9-baaf-4f87-8dd6-135fcf9fb129/vieeafrv2keadbjzy0nd.jpg	f	\N
a1791b01-94e2-4b15-93ea-9e54b81b7441	cf10d9f9-baaf-4f87-8dd6-135fcf9fb129	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354866/products/cf10d9f9-baaf-4f87-8dd6-135fcf9fb129/dtfldkl5gvq8vf8fqcru.jpg	f	\N
d1f31a6a-c470-426c-8e16-3f2824dd6997	933cd7d8-45bc-41fd-9811-705e75819a33	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354940/products/933cd7d8-45bc-41fd-9811-705e75819a33/gdliydles0jlcug7d1ln.avif	f	\N
9ec4d5e4-1f9a-4b62-8334-b9e2cd4a1b15	933cd7d8-45bc-41fd-9811-705e75819a33	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354940/products/933cd7d8-45bc-41fd-9811-705e75819a33/swlsjia2qxcsduns7qyp.avif	f	\N
ca823f83-eda2-4930-90b1-fc0b91b3c04e	933cd7d8-45bc-41fd-9811-705e75819a33	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354941/products/933cd7d8-45bc-41fd-9811-705e75819a33/mhdwld5qgwnmldgl2paq.avif	f	\N
ea38936c-9098-458f-a451-af53b16f762d	933cd7d8-45bc-41fd-9811-705e75819a33	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354941/products/933cd7d8-45bc-41fd-9811-705e75819a33/pisy7yei2b9e5nmeu2wy.avif	f	\N
7307459b-3997-496b-860d-34eecbfaf598	933cd7d8-45bc-41fd-9811-705e75819a33	https://res.cloudinary.com/do8svjo8h/image/upload/v1779354941/products/933cd7d8-45bc-41fd-9811-705e75819a33/zhzc3ktlufwvghrs9zlg.avif	f	\N
85daaa33-a0e3-4f1a-98cc-92ee883b70e8	da23d738-724a-47d6-8721-c8b93653eb88	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355018/products/da23d738-724a-47d6-8721-c8b93653eb88/wuhtrisuyjv76hvmpixo.avif	f	\N
200b7b6d-df95-49ab-b009-f0ec2d6f008f	da23d738-724a-47d6-8721-c8b93653eb88	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355018/products/da23d738-724a-47d6-8721-c8b93653eb88/esmouweywyom13hmjbtw.avif	f	\N
48de2689-e661-4d50-bf18-390c05086208	da23d738-724a-47d6-8721-c8b93653eb88	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355019/products/da23d738-724a-47d6-8721-c8b93653eb88/aq0uumwgbet6zh5pupsd.avif	f	\N
4e41f917-cd07-40e9-9209-270f057f06d6	da23d738-724a-47d6-8721-c8b93653eb88	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355018/products/da23d738-724a-47d6-8721-c8b93653eb88/mmlcdcb65sskcxbrqdh9.avif	f	\N
35fdd0c8-e0b6-49cb-bb66-074697d2c7d6	da23d738-724a-47d6-8721-c8b93653eb88	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355019/products/da23d738-724a-47d6-8721-c8b93653eb88/xan9ix6novbuyc1surzm.avif	f	\N
248dbc6e-b2a7-43e3-bbfb-f5a726ab14b4	680a8690-635c-4b55-8379-77d6b41f001a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355102/products/680a8690-635c-4b55-8379-77d6b41f001a/iuk1jrthmeev9xfpncig.avif	f	\N
b3ac6b59-0181-4b97-9870-b5b17bf2ca40	680a8690-635c-4b55-8379-77d6b41f001a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355103/products/680a8690-635c-4b55-8379-77d6b41f001a/kmow7y5q8yvpg9tk5465.avif	f	\N
573e6e5f-c82c-4eb8-8558-8ddc57c3ef1b	680a8690-635c-4b55-8379-77d6b41f001a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355103/products/680a8690-635c-4b55-8379-77d6b41f001a/gtxhziziox7wkovyxpu3.avif	f	\N
beeda04f-8702-4bf2-ada3-a724bbadf333	680a8690-635c-4b55-8379-77d6b41f001a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355102/products/680a8690-635c-4b55-8379-77d6b41f001a/tjf2squragwbv89zasxy.avif	f	\N
058ff23b-377f-4e72-ac6a-829beea2e59d	680a8690-635c-4b55-8379-77d6b41f001a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355102/products/680a8690-635c-4b55-8379-77d6b41f001a/s2a2g1fcdwebzbdbjhn4.avif	f	\N
c83ff73b-945d-496e-9cb0-e776a4c5cd4a	e224a495-cc12-4069-a901-236170864bed	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355233/products/e224a495-cc12-4069-a901-236170864bed/agyk534xinthcjr84r6f.webp	f	\N
16ad80bf-d371-484b-965d-b65baf5b2610	e224a495-cc12-4069-a901-236170864bed	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355233/products/e224a495-cc12-4069-a901-236170864bed/psnffkxpvvrhc9dtcbqd.webp	f	\N
c6a7bc50-75d7-43af-8d21-b416222dfbe4	e224a495-cc12-4069-a901-236170864bed	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355234/products/e224a495-cc12-4069-a901-236170864bed/eibedgdpwik2h1j5kvnr.webp	f	\N
8f69ca81-f22b-46ef-8ab9-b3becb33794a	e224a495-cc12-4069-a901-236170864bed	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355237/products/e224a495-cc12-4069-a901-236170864bed/ni3hvx8fehhlfjavudrg.webp	f	\N
8e66f215-05c9-485b-8ab4-3e0245b9c978	e224a495-cc12-4069-a901-236170864bed	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355233/products/e224a495-cc12-4069-a901-236170864bed/rkippk6jaxkv7rpowgfp.webp	f	\N
70d49a86-9653-4699-a0d3-104fef3dd0ba	deb5397a-890f-4699-a7c6-abefc52b6e23	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355303/products/deb5397a-890f-4699-a7c6-abefc52b6e23/tf6dzicganmbolgutmop.webp	f	\N
e2772953-8d55-47b4-bbcc-01708c961f95	deb5397a-890f-4699-a7c6-abefc52b6e23	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355303/products/deb5397a-890f-4699-a7c6-abefc52b6e23/r78lzybkwykkqcyrzhc9.webp	f	\N
da1fbf05-255c-459e-88d8-1faa727c0357	deb5397a-890f-4699-a7c6-abefc52b6e23	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355302/products/deb5397a-890f-4699-a7c6-abefc52b6e23/jc9fvbiofm3wmszn37ca.webp	f	\N
1ddf751e-f782-4459-81f9-eb2f0ae54f0b	deb5397a-890f-4699-a7c6-abefc52b6e23	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355302/products/deb5397a-890f-4699-a7c6-abefc52b6e23/lhvemxbegun52mbnmavk.webp	f	\N
150cd174-6fb2-40f3-95db-d379acef6837	deb5397a-890f-4699-a7c6-abefc52b6e23	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355303/products/deb5397a-890f-4699-a7c6-abefc52b6e23/mpa7eopojnzduw7qrnbe.webp	f	\N
50895eff-05df-43bb-975e-5829d1caf2a9	d4bfe112-a4db-4ccd-8280-ba952215e317	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355411/products/d4bfe112-a4db-4ccd-8280-ba952215e317/npdkjh75ktaiiozwphgw.webp	f	\N
f203dfc3-0d38-4d0a-8db0-93423a013b1b	d4bfe112-a4db-4ccd-8280-ba952215e317	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355411/products/d4bfe112-a4db-4ccd-8280-ba952215e317/nhxqggbzkh29ftgxtiy3.webp	f	\N
9957a201-be4d-4606-a657-7f6496772b3f	d4bfe112-a4db-4ccd-8280-ba952215e317	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355411/products/d4bfe112-a4db-4ccd-8280-ba952215e317/z7ltpwivavx8ai4ho14k.webp	f	\N
c7d96da9-a74d-47f3-bf35-4269ae794043	d4bfe112-a4db-4ccd-8280-ba952215e317	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355411/products/d4bfe112-a4db-4ccd-8280-ba952215e317/bhxf3pqonqj89leenldx.webp	f	\N
7c939a31-8275-4d96-ac57-dacb922e7aff	d4bfe112-a4db-4ccd-8280-ba952215e317	https://res.cloudinary.com/do8svjo8h/image/upload/v1779355411/products/d4bfe112-a4db-4ccd-8280-ba952215e317/cfwqs5vprh6los2lpvfn.webp	f	\N
47651edd-0ac3-4d29-a5a6-9f759fc08cb1	1e1b58b3-781c-4d3a-b4ff-40002d5fad6d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356536/products/1e1b58b3-781c-4d3a-b4ff-40002d5fad6d/lfryveyfe9vvbj2zz3jk.jpg	f	\N
8fca8af8-6b65-4226-aa9c-707323e809df	4fa704d7-8f58-4fee-819c-913f8583bf99	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356664/products/4fa704d7-8f58-4fee-819c-913f8583bf99/uzvko72gcsy56he1omxt.jpg	f	\N
e3d14900-9434-40d3-bacf-070832a354c6	4fa704d7-8f58-4fee-819c-913f8583bf99	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356663/products/4fa704d7-8f58-4fee-819c-913f8583bf99/pj9birzrhrxhuzryhbbi.jpg	f	\N
75ceff82-b7be-403e-94a6-cae54545afb4	4fa704d7-8f58-4fee-819c-913f8583bf99	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356664/products/4fa704d7-8f58-4fee-819c-913f8583bf99/tyotsk2nbnuk3wadnig1.jpg	f	\N
9bb3efee-b75c-4df3-b5d1-f5b151ffc17c	4fa704d7-8f58-4fee-819c-913f8583bf99	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356663/products/4fa704d7-8f58-4fee-819c-913f8583bf99/gitmvpqcy4giazixb4wp.jpg	f	\N
7c9919db-31ae-4215-8db1-dc150a133a2f	4fa704d7-8f58-4fee-819c-913f8583bf99	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356664/products/4fa704d7-8f58-4fee-819c-913f8583bf99/nqtuj7nvqovkjh42t2jp.png	f	\N
d91cf8a8-1350-4727-bf3a-60e67adfe9be	600a9046-2e76-4070-bb44-3f8042af6c44	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356820/products/600a9046-2e76-4070-bb44-3f8042af6c44/rjdkno2kamt187tsg2i4.jpg	f	\N
f598b071-5173-4601-90f4-e36c6d8bb68d	600a9046-2e76-4070-bb44-3f8042af6c44	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356820/products/600a9046-2e76-4070-bb44-3f8042af6c44/zbnm4rcvzfojz4wiiglf.png	f	\N
cf87fece-4c03-4da0-825a-7eccee585c4c	e84a6278-a906-4b6d-8d7d-05a919923b37	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356891/products/e84a6278-a906-4b6d-8d7d-05a919923b37/anzsffig42sshlbe9oqv.webp	f	\N
fd6eab62-95cf-4a67-90c7-7eed507e21bd	e84a6278-a906-4b6d-8d7d-05a919923b37	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356891/products/e84a6278-a906-4b6d-8d7d-05a919923b37/yww0gzi2sde0yxcbm3rf.webp	f	\N
a23be0c7-fb68-49f1-b755-844885e56097	e84a6278-a906-4b6d-8d7d-05a919923b37	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356891/products/e84a6278-a906-4b6d-8d7d-05a919923b37/digelpf7doqctqvl3ys0.webp	f	\N
6552a900-1a54-46fd-be54-987374e54aab	e84a6278-a906-4b6d-8d7d-05a919923b37	https://res.cloudinary.com/do8svjo8h/image/upload/v1779356891/products/e84a6278-a906-4b6d-8d7d-05a919923b37/mq6ey9st0zzlchfl3uc1.webp	f	\N
b7ec4fd7-8152-4d1d-bf7c-a39b406f2f0f	e9359b5f-7db9-4f18-aefd-a8695f2e413d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363387/products/e9359b5f-7db9-4f18-aefd-a8695f2e413d/xbhzg8fx16f86z9q4ib7.png	f	\N
9f1ed496-bb91-4e88-89bc-90e724fc28e0	e9359b5f-7db9-4f18-aefd-a8695f2e413d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363387/products/e9359b5f-7db9-4f18-aefd-a8695f2e413d/kx09dnpwdx3k7mhgsfxy.png	f	\N
1f96bc7c-397b-49eb-b1a2-b004a13376ed	e9359b5f-7db9-4f18-aefd-a8695f2e413d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363387/products/e9359b5f-7db9-4f18-aefd-a8695f2e413d/lugd1lonosjc8aczk3ku.png	f	\N
55206ece-aef8-41f5-8e7a-d52f8fb99bc2	e9359b5f-7db9-4f18-aefd-a8695f2e413d	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363387/products/e9359b5f-7db9-4f18-aefd-a8695f2e413d/mqlqhcc21gx4n9sfsnbg.jpg	f	\N
f5ca4880-dd91-45d8-9aa5-a83b70634b1a	ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363502/products/ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9/xxvzc0s1c4u4uqvh48uv.webp	f	\N
20627457-9a77-43f1-b1ca-c6230f3b5f70	ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363502/products/ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9/db4lbiatoutnjyyibbig.webp	f	\N
b2f45b77-d607-49d7-bfc3-b0e75598e0c0	ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363502/products/ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9/jet3cub81gzds4p88o9i.webp	f	\N
b942499d-ad9a-4af7-83cf-bde3bc0d61af	ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363502/products/ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9/dd2h52mqnawzrxjau10f.webp	f	\N
bc1d5479-fc81-4674-a4c7-bc5abd554298	ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363502/products/ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9/f9crxdhrryyaiawokwfe.webp	f	\N
cea923fa-29d7-4c0d-951f-56b3e6cb2f6c	9c71218d-e2b2-45b4-82c4-6bc409deab30	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363596/products/9c71218d-e2b2-45b4-82c4-6bc409deab30/tq7p0rbdnyuwmk8td0cm.png	f	\N
5f3975fa-aa7c-48e7-8716-7140b8917916	9c71218d-e2b2-45b4-82c4-6bc409deab30	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363596/products/9c71218d-e2b2-45b4-82c4-6bc409deab30/zj2fpmxq5ie9420mnhsx.png	f	\N
46c2bbcc-50c1-4735-a0a8-f3b39fa52f2a	9c71218d-e2b2-45b4-82c4-6bc409deab30	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363596/products/9c71218d-e2b2-45b4-82c4-6bc409deab30/kfc1xr8wslbxjppxfzt3.png	f	\N
2a27c594-15ce-4cd5-9930-211c33e342c4	9c71218d-e2b2-45b4-82c4-6bc409deab30	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363596/products/9c71218d-e2b2-45b4-82c4-6bc409deab30/funlvntkpw3fhiezaphw.png	t	\N
9843f376-2c8e-4f53-9e78-31cbcfc0d300	796e9a56-15cc-4714-bb85-e3d6c1f91683	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363743/products/796e9a56-15cc-4714-bb85-e3d6c1f91683/yg6ww7qmhmrvrmtbddlh.webp	f	\N
46950e80-4f60-45da-a214-7dabc7df5ac3	796e9a56-15cc-4714-bb85-e3d6c1f91683	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363742/products/796e9a56-15cc-4714-bb85-e3d6c1f91683/tmbjhxzzobpscv65s3sn.webp	f	\N
393f30e8-26d9-469b-bedb-321a4c6a1297	796e9a56-15cc-4714-bb85-e3d6c1f91683	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363742/products/796e9a56-15cc-4714-bb85-e3d6c1f91683/rmwjnmo9dmtzvycnpfld.webp	f	\N
aa75c7a0-e7f7-4b03-a7b9-dc5420f337df	796e9a56-15cc-4714-bb85-e3d6c1f91683	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363742/products/796e9a56-15cc-4714-bb85-e3d6c1f91683/d4nzddeaszuevizrl0rs.webp	f	\N
82dd5ead-f2d1-43fc-a4f0-04d3d4c89caf	fee8606c-eacb-427f-8807-5f6213f88afd	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363887/products/fee8606c-eacb-427f-8807-5f6213f88afd/mrkyusaez6xviz3oheg5.webp	f	\N
4994c3ad-4d2b-4fa9-afb6-00f3feb956a4	fee8606c-eacb-427f-8807-5f6213f88afd	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363887/products/fee8606c-eacb-427f-8807-5f6213f88afd/hnxf6xbgwscwfmhhulia.webp	f	\N
df25a4f2-e15f-44cb-b400-8d44d0c12222	cc9f0adb-1cd7-46a9-bc5e-74733adfb16c	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363951/products/cc9f0adb-1cd7-46a9-bc5e-74733adfb16c/gza1xhs2amluzdnzozbw.webp	f	\N
677029fe-c41f-437c-a431-90539a74da0c	cc9f0adb-1cd7-46a9-bc5e-74733adfb16c	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363951/products/cc9f0adb-1cd7-46a9-bc5e-74733adfb16c/vob3grb77jbyf7ovusjc.webp	f	\N
900bb0f1-5c4a-4279-bf02-a21b7bddca4d	cc9f0adb-1cd7-46a9-bc5e-74733adfb16c	https://res.cloudinary.com/do8svjo8h/image/upload/v1779363951/products/cc9f0adb-1cd7-46a9-bc5e-74733adfb16c/hmddghrdpyxrdgd72rfn.webp	f	\N
80c45102-60e5-4758-bed9-6b73fbfd5364	14754302-9e0f-4419-b8f1-0f5d6e6e21a1	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364054/products/14754302-9e0f-4419-b8f1-0f5d6e6e21a1/wkhdflwirzpmechlhitw.jpg	f	\N
0337a952-3146-4ad9-a889-8f3632f6fa27	14754302-9e0f-4419-b8f1-0f5d6e6e21a1	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364054/products/14754302-9e0f-4419-b8f1-0f5d6e6e21a1/wqs5llamt6hvcymipgjt.jpg	f	\N
606554dc-f551-4e15-a2f1-b93d491c6c5e	14754302-9e0f-4419-b8f1-0f5d6e6e21a1	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364054/products/14754302-9e0f-4419-b8f1-0f5d6e6e21a1/dglib5nawgo0wpb5cbd8.jpg	f	\N
3a164968-7959-4ea7-a0e5-675351a23883	14754302-9e0f-4419-b8f1-0f5d6e6e21a1	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364054/products/14754302-9e0f-4419-b8f1-0f5d6e6e21a1/umrpidzvhnqqug7ivzbu.jpg	f	\N
283b3de0-a9ce-4a16-a449-4e8e9a40fcfa	14754302-9e0f-4419-b8f1-0f5d6e6e21a1	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364054/products/14754302-9e0f-4419-b8f1-0f5d6e6e21a1/kxttueunqdhscu1gvcga.jpg	f	\N
4c4bd336-9aa3-42a4-9288-cf3a4960e09f	50c35079-75e4-4e64-9531-752c1e41705f	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364131/products/50c35079-75e4-4e64-9531-752c1e41705f/dgoqqooz8ky4dytmusdu.jpg	f	\N
1ad468d8-043f-47d5-982a-b6791127baf1	50c35079-75e4-4e64-9531-752c1e41705f	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364130/products/50c35079-75e4-4e64-9531-752c1e41705f/msqkpaod0qa9h7rwrjz9.jpg	f	\N
5b8c99d7-cda5-4937-9560-d13024e28872	50c35079-75e4-4e64-9531-752c1e41705f	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364133/products/50c35079-75e4-4e64-9531-752c1e41705f/zzjqc4nip0ldy4ghaiyt.jpg	f	\N
a2b1b4e2-596c-4b65-99df-f0b819f2e6eb	50c35079-75e4-4e64-9531-752c1e41705f	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364131/products/50c35079-75e4-4e64-9531-752c1e41705f/rbx6pkkapbtqypvkomko.jpg	f	\N
ca6bd15a-34ea-4498-b4f1-bf8726c837cb	6176c2a5-1313-4510-8a82-f468a30c7360	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364324/products/6176c2a5-1313-4510-8a82-f468a30c7360/xkxds66fnvmndx5jadyv.webp	f	\N
27e75d0f-6ec8-4f46-9d7c-02bdda21b38a	6176c2a5-1313-4510-8a82-f468a30c7360	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364325/products/6176c2a5-1313-4510-8a82-f468a30c7360/mzqefnnwwjdryvcb1gd2.webp	f	\N
c61b239d-6a6a-495b-8e7e-c86059bae74c	6176c2a5-1313-4510-8a82-f468a30c7360	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364325/products/6176c2a5-1313-4510-8a82-f468a30c7360/efv1xvusjoqi8o9l8nnb.webp	f	\N
414350b5-6a8e-49cf-bf9a-bbf3ac86a889	6176c2a5-1313-4510-8a82-f468a30c7360	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364324/products/6176c2a5-1313-4510-8a82-f468a30c7360/kdn7e3yxktdqbc1plqss.webp	f	\N
33cdb618-8e20-4552-b069-abf92a13c0c3	6200cfd7-34c8-4f4d-8a7a-1e7269036d13	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364412/products/6200cfd7-34c8-4f4d-8a7a-1e7269036d13/vtuqhegg8h45gsy4plnd.jpg	f	\N
4007312c-4df7-43dd-b1f5-8fe7830d7a2c	6200cfd7-34c8-4f4d-8a7a-1e7269036d13	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364413/products/6200cfd7-34c8-4f4d-8a7a-1e7269036d13/qpwzzjrfw90928bwymsg.jpg	f	\N
8cbfb50a-cbd9-416a-8623-c7316b47d1ff	6200cfd7-34c8-4f4d-8a7a-1e7269036d13	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364412/products/6200cfd7-34c8-4f4d-8a7a-1e7269036d13/z5sg4gwiq4uear5ts1j8.jpg	f	\N
7e1a466d-b240-4e28-a1b9-1c3f9cda6cd6	6200cfd7-34c8-4f4d-8a7a-1e7269036d13	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364413/products/6200cfd7-34c8-4f4d-8a7a-1e7269036d13/ukdvb1rvens8pwybdlrm.jpg	f	\N
d6259fbd-a690-4b29-a1ae-56d836c78da5	50268195-45d5-4cd7-be3e-91f1f249bc22	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364588/products/50268195-45d5-4cd7-be3e-91f1f249bc22/l9lkjyr4vohcvhqx2hpc.jpg	f	\N
3aa2d019-840f-4321-ac43-ccc7195fb0a0	50268195-45d5-4cd7-be3e-91f1f249bc22	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364587/products/50268195-45d5-4cd7-be3e-91f1f249bc22/qq7pzy7w9azzczp6puzq.jpg	f	\N
dce90b6f-f02a-4f98-919a-37a31efad058	50268195-45d5-4cd7-be3e-91f1f249bc22	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364588/products/50268195-45d5-4cd7-be3e-91f1f249bc22/fj6mzdmxi0ch9oncot6e.jpg	f	\N
76859ba3-ba19-4a2c-b792-cab713d128f2	50268195-45d5-4cd7-be3e-91f1f249bc22	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364588/products/50268195-45d5-4cd7-be3e-91f1f249bc22/ymq6jjpfciwo8sxoiqx3.jpg	f	\N
ce3a2429-613d-419c-a6a1-ec24a789a10c	50268195-45d5-4cd7-be3e-91f1f249bc22	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364588/products/50268195-45d5-4cd7-be3e-91f1f249bc22/kqq8c81wwijqszreluds.jpg	f	\N
191b605d-83c6-4bde-abd3-4ffb97180b3b	0e280f36-d54e-4b1a-93dd-4067c020bea7	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364841/products/0e280f36-d54e-4b1a-93dd-4067c020bea7/qkkpfdmsbsetlatiqpt4.webp	f	\N
433b1289-94d4-40f1-8565-042a8f7a91c4	2dcc7110-b084-4b84-84de-d5e84bc7d430	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364973/products/2dcc7110-b084-4b84-84de-d5e84bc7d430/h1f5xwd654em9utnud9d.webp	f	\N
35fba9fc-4e06-47c5-9d68-8554d602b112	2dcc7110-b084-4b84-84de-d5e84bc7d430	https://res.cloudinary.com/do8svjo8h/image/upload/v1779364973/products/2dcc7110-b084-4b84-84de-d5e84bc7d430/gpc6bm7gsevbedzweq8i.webp	f	\N
dc26191f-d3e2-4c58-9f2d-c2f1907a6308	071f40e6-c400-4f01-a1c6-cf0d93cec0e5	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365045/products/071f40e6-c400-4f01-a1c6-cf0d93cec0e5/lssbx22jy0tpjguy6ttc.webp	f	\N
ce94df28-1132-48e9-af17-a889e830bd4c	071f40e6-c400-4f01-a1c6-cf0d93cec0e5	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365045/products/071f40e6-c400-4f01-a1c6-cf0d93cec0e5/wiiymrcqnwjvv0rslpwa.webp	f	\N
3f9717a5-3f11-4a8e-b37e-6957125083be	071f40e6-c400-4f01-a1c6-cf0d93cec0e5	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365045/products/071f40e6-c400-4f01-a1c6-cf0d93cec0e5/llxhe1ixoadcp9nkuarp.webp	f	\N
263e31b5-883e-4241-a583-69932b0c8fa8	f7b1cd79-08af-49f5-93c1-ae83c32977b9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365124/products/f7b1cd79-08af-49f5-93c1-ae83c32977b9/nwm57m0lkc3srzv4brb9.jpg	f	\N
3a09a353-ac26-4475-8f83-9a97d8e65cd6	f7b1cd79-08af-49f5-93c1-ae83c32977b9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365124/products/f7b1cd79-08af-49f5-93c1-ae83c32977b9/smxcsr2r9uakzkjdjkhs.jpg	f	\N
1ef6cf62-bfd8-4501-b697-155841aaccd8	f7b1cd79-08af-49f5-93c1-ae83c32977b9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365124/products/f7b1cd79-08af-49f5-93c1-ae83c32977b9/wr1ntinp1xfffssiuskd.jpg	f	\N
2602d95a-a26a-487f-9b0d-d5da86b31cc1	f7b1cd79-08af-49f5-93c1-ae83c32977b9	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365124/products/f7b1cd79-08af-49f5-93c1-ae83c32977b9/w8xww3gbtdlraglb36ub.jpg	f	\N
1b5648d8-28ee-434f-bca9-893bb2786b9a	93dc4b66-f386-42a1-9dfb-9cb8f484e11a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365214/products/93dc4b66-f386-42a1-9dfb-9cb8f484e11a/j9ddfmhoxxzlfyytipm8.avif	f	\N
19a63c7e-f985-4491-a3b5-ffb4da39a3a2	93dc4b66-f386-42a1-9dfb-9cb8f484e11a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365214/products/93dc4b66-f386-42a1-9dfb-9cb8f484e11a/px4pktaiahjdypzfa0gi.avif	f	\N
820aa88f-62f9-40e9-937b-e0ad839177da	93dc4b66-f386-42a1-9dfb-9cb8f484e11a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365214/products/93dc4b66-f386-42a1-9dfb-9cb8f484e11a/xqgnysw3zpj0wt4fqya8.avif	f	\N
2bf2a685-de5f-47be-9134-8b4ffad41eed	93dc4b66-f386-42a1-9dfb-9cb8f484e11a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365214/products/93dc4b66-f386-42a1-9dfb-9cb8f484e11a/rm5rvzicy1fp9mdpslx3.avif	f	\N
c475262d-596a-4b1e-ab16-103b721f7adb	93dc4b66-f386-42a1-9dfb-9cb8f484e11a	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365214/products/93dc4b66-f386-42a1-9dfb-9cb8f484e11a/so6zbu7qz08wxur2brul.avif	f	\N
879a9493-34c3-4a71-b1cd-003b7ea688eb	9251db4c-b9bf-474d-bf4a-b8b2971f1067	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365329/products/9251db4c-b9bf-474d-bf4a-b8b2971f1067/z3l5rz4peuaygmluoop3.webp	f	\N
bbd3e61f-8e7c-4dd6-bb59-2dd327380878	9251db4c-b9bf-474d-bf4a-b8b2971f1067	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365329/products/9251db4c-b9bf-474d-bf4a-b8b2971f1067/v1c4xdwkmsssgpzcyerz.webp	f	\N
cfc5505f-6e07-4b8d-9753-9e41fe0ee443	9251db4c-b9bf-474d-bf4a-b8b2971f1067	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365329/products/9251db4c-b9bf-474d-bf4a-b8b2971f1067/v0ylxrmqkkaye1izhtbf.webp	f	\N
416b2dd7-41f1-4b79-8b7b-9fe461cf2731	9251db4c-b9bf-474d-bf4a-b8b2971f1067	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365329/products/9251db4c-b9bf-474d-bf4a-b8b2971f1067/dvqqnxuhasv2r13dkhzn.webp	f	\N
54641b39-ac80-49f4-83b3-5d433e449d04	9251db4c-b9bf-474d-bf4a-b8b2971f1067	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365328/products/9251db4c-b9bf-474d-bf4a-b8b2971f1067/kppvrwjtj6wopzbzqo93.webp	f	\N
e77a1077-33ad-4840-b577-ce37f8b13690	da43852a-66b7-4c5d-a92b-812c6b985327	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365419/products/da43852a-66b7-4c5d-a92b-812c6b985327/f1dvmjpiy3t0cfsbakiu.webp	f	\N
09eb3a39-c6a9-4918-87be-0c5f4fa5bda9	da43852a-66b7-4c5d-a92b-812c6b985327	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365420/products/da43852a-66b7-4c5d-a92b-812c6b985327/hqefxnf166tkhrnseqn1.webp	f	\N
97743e56-a653-4b79-8b7c-251a46662134	da43852a-66b7-4c5d-a92b-812c6b985327	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365420/products/da43852a-66b7-4c5d-a92b-812c6b985327/ibwl3ctk3pi2clxucp17.webp	f	\N
58c604a7-ff0a-4402-907d-2316357a2065	da43852a-66b7-4c5d-a92b-812c6b985327	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365419/products/da43852a-66b7-4c5d-a92b-812c6b985327/isiq52xtglm3v3ocs94g.avif	f	\N
4f02fbd6-6503-448b-9353-9d8fba3d7c5e	da43852a-66b7-4c5d-a92b-812c6b985327	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365419/products/da43852a-66b7-4c5d-a92b-812c6b985327/psvawkbh710uffnwrrzw.avif	f	\N
4059eb17-fb58-4b96-91fb-ac8959c0ca68	db4dc78a-a17c-4b70-9e3e-0d48594194e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365513/products/db4dc78a-a17c-4b70-9e3e-0d48594194e6/ijja7ia4l9lfydxrme9v.jpg	f	\N
86bd2861-41a9-42a0-8f78-622000f11bb8	db4dc78a-a17c-4b70-9e3e-0d48594194e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365513/products/db4dc78a-a17c-4b70-9e3e-0d48594194e6/kpsvqbciuwnktlkriqff.jpg	f	\N
2689c81e-4059-4d7a-b47e-89a94f3ae19f	db4dc78a-a17c-4b70-9e3e-0d48594194e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365513/products/db4dc78a-a17c-4b70-9e3e-0d48594194e6/zuywm7u6ywzpfisy9kky.jpg	f	\N
c75e3c94-ba4d-44ba-83e7-9d10a77e00a6	db4dc78a-a17c-4b70-9e3e-0d48594194e6	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365513/products/db4dc78a-a17c-4b70-9e3e-0d48594194e6/ewzdihkceghanjvs7f1q.jpg	f	\N
f615f7e3-19f5-4f8c-b2a2-68e71b997ee9	c91b1cc7-491d-4a43-aa66-5131db286ded	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365596/products/c91b1cc7-491d-4a43-aa66-5131db286ded/jnjoenofmfkpxhxdgzto.webp	f	\N
393a1a65-a52a-489c-a64b-37198390f802	c91b1cc7-491d-4a43-aa66-5131db286ded	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365597/products/c91b1cc7-491d-4a43-aa66-5131db286ded/ih1odfsm5wwv9gs2fe7o.webp	f	\N
99989e6c-ce26-4470-b7f2-471d9d423bf8	c91b1cc7-491d-4a43-aa66-5131db286ded	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365596/products/c91b1cc7-491d-4a43-aa66-5131db286ded/tw8rt1bquavgqmhtbwzq.webp	f	\N
322ea732-473a-49bd-b415-f58955ee812f	c91b1cc7-491d-4a43-aa66-5131db286ded	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365597/products/c91b1cc7-491d-4a43-aa66-5131db286ded/pduffoh8hv7vx6r9i4jr.webp	f	\N
a894dc6b-8354-4124-a067-65e792a5f412	c91b1cc7-491d-4a43-aa66-5131db286ded	https://res.cloudinary.com/do8svjo8h/image/upload/v1779365596/products/c91b1cc7-491d-4a43-aa66-5131db286ded/xpioyjgxhxbdmiqylm33.webp	f	\N
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."ProductVariant" (id, "productId", sku, name, price, stock, attributes) FROM stdin;
a04374e9-eff2-43a5-954a-b788783456cd	49189589-4122-41b9-9f55-2cd9954d0141	25t4y	Mặc định	12345678.00	12	\N
94accc31-6eb8-4d9f-9899-71c38054fb7f	24736bc5-5851-46ce-941e-5c69cbb20914	rge64y	Mặc định	350000.00	32	\N
ea99369e-4eef-4f22-9fc9-cdc1d869e8b9	1949fb1b-6b79-4c63-a319-4b83faa87f2d	tr3t4	Mặc định	35477.00	45	\N
23660cb1-5d65-4623-9768-aeab2e62b765	9c71218d-e2b2-45b4-82c4-6bc409deab30	fjiu9g6	Mặc định	15400000.00	26	\N
7889ce18-83a7-4808-b808-07f58238e4dc	c91b1cc7-491d-4a43-aa66-5131db286ded	hkh8f6	Mặc định	5490000.00	13	\N
2f2dabac-bce2-418f-9f3f-6bac20fa961d	0edd5422-68eb-4e94-9030-b9a67afea7dd	SKU-PZUABAJ0	Mặc định	561014.00	53	\N
22b271e9-07cc-40f1-9386-ad25a501a5a4	0edd5422-68eb-4e94-9030-b9a67afea7dd	SKU-6SCRB76F	Bản Cao Cấp	1270773.00	23	\N
b4299fe9-649a-44bf-a5ba-e44fb458237f	933cd7d8-45bc-41fd-9811-705e75819a33	bi79h	Mặc định	15000000.00	54	\N
8dc0f434-6ad2-485e-9664-ddfde1dbe4c8	680a8690-635c-4b55-8379-77d6b41f001a	fgu8ygft	Mặc định	5500000.00	67	\N
28db1b85-4571-440a-b043-0e9dc943850a	fee8606c-eacb-427f-8807-5f6213f88afd	wiuo767	Mặc định	1500000.00	11	\N
60d9bc5e-4148-49b7-bf3b-9f351ffff348	50c35079-75e4-4e64-9531-752c1e41705f	huigyg65c	Mặc định	16500000.00	98	\N
fc92c5c6-3c66-434f-9554-fa96174500e4	3430a0e3-d0d7-4f21-94c2-f4e793da4d3b	u6jtjtej	Mặc định	54575868.00	54	\N
16678267-4a1c-475c-a033-09a017a2e88e	a4f7fd8a-a14b-4030-8136-457956dcf3d2	v7g8ig	Mặc định	2345678.00	63	\N
c0c52efb-42f7-4fca-8a5f-21de53927136	f994ac8a-37e1-4273-81fb-74e4e7958dc2	ry5t4	Mặc định	456345.00	35	\N
d5c4a3cb-6648-4744-9154-0f0f051a2d3d	da23d738-724a-47d6-8721-c8b93653eb88	fyuh88h	Mặc định	17000000.00	89	\N
02f7d79a-5ae8-4812-8850-1e10feb7e712	e224a495-cc12-4069-a901-236170864bed	dty7gk	Mặc định	1200000.00	4	\N
370b902d-6634-4f8a-8ebd-8ab5764e485b	cc9f0adb-1cd7-46a9-bc5e-74733adfb16c	uoiy76gg	Mặc định	1790000.00	23	\N
b156d2be-f83b-4b65-b77a-bbc7d02d64ab	14754302-9e0f-4419-b8f1-0f5d6e6e21a1	yui78ft	Mặc định	10500000.00	32	\N
7e037de8-f7f2-421b-a7a5-276002152e4a	eb7fbe43-7296-449a-aa50-8c62f5b37f40	io7t8f8	Mặc định	24444566.00	36	\N
7400b358-e61d-46dd-ae7c-9351729bcc2c	c8907458-7814-46b1-b9e3-4d606b831b5c	gh5et5y	Mặc định	6564767.00	65	\N
c9116ae9-78af-45fc-82ce-597103e412d5	569d040a-b54c-4594-a865-0b5aa214a8e2	e5uhf	Mặc định	35350.00	35	\N
559556fb-5fb6-438a-a2c7-6198e310ac50	deb5397a-890f-4699-a7c6-abefc52b6e23	8g8g89	Mặc định	345000.00	56	\N
b634179e-ca13-4b00-b489-c794c4320e5f	6176c2a5-1313-4510-8a82-f468a30c7360	aonam6677	Mặc định	295000.00	12	\N
113be37c-32e5-414e-85e4-1e64be10d00c	6200cfd7-34c8-4f4d-8a7a-1e7269036d13	dfgh6t7fvu	Mặc định	1490000.00	45	\N
550cd5b3-e60f-48d7-b3d7-edab1890c41d	d19ec357-922f-4bbe-8d68-e82bdd102434	34gre4	Mặc định	4657474.00	36	\N
ad7b9438-2530-4662-a7ac-c3ee28be708c	c5be2391-81bc-4112-96c7-9d6f001fa416	bgiu7viv	Mặc định	4567890.00	86	\N
2c7e218e-523a-4589-9f9f-254fdff439a3	d4bfe112-a4db-4ccd-8280-ba952215e317	try454ut	Mặc định	567000.00	65	\N
87752710-971e-4bb3-9964-ca3a6f5cb25c	50268195-45d5-4cd7-be3e-91f1f249bc22	agxfs76sx	Mặc định	53990000.00	13	\N
16624f4a-6ec5-4731-9e38-68d0e5de8887	4fbf0a8e-3761-4e0c-8518-95e14d45f855	bo7yo8	Mặc định	897969.00	87	\N
aa2a41d2-0401-41ec-85f0-b41ee0c97bd6	af28dfc2-91ef-4715-93a6-6e5e42b4b15d	tey5yf	Mặc định	4674533.00	65	\N
57a22d16-210e-458a-90fd-73b98b000b4e	1e1b58b3-781c-4d3a-b4ff-40002d5fad6d	3trg5	Mặc định	345000.00	33	\N
b6255284-0bfd-4ff6-98c3-4374c621908c	0e280f36-d54e-4b1a-93dd-4067c020bea7	ghiuhui67fy	Mặc định	8990000.00	2	\N
3906b804-fd3b-4386-b1c2-ae6a836a3a4d	ccd909a5-fa59-4253-ae4e-1db9b104e704	e46erg5	Mặc định	4765869.00	32	\N
64d29c20-1e8e-4d16-9d57-872134ea8d9f	d708039f-b2a9-4868-b262-1793fb19bb25	325fger43	Mặc định	39999999.00	10	\N
2ce27f43-39cf-4ef7-b60d-7c869aea9231	4fa704d7-8f58-4fee-819c-913f8583bf99	dhf7fjv	Mặc định	8199000.00	15	\N
5c5fd2fd-3eb9-4c1f-89ce-5a0c8851565b	2dcc7110-b084-4b84-84de-d5e84bc7d430	iog6tf	Mặc định	590000.00	16	\N
498c64a4-67eb-4f50-b9e9-8280ea290cee	db10b02c-58f1-402e-bcd4-d7f247ed54d5	4e78f8	Mặc định	4564665.00	88	\N
936ceb5c-c035-428b-b6c5-b9ea81a6f2d9	b0fd4c30-13c4-41ee-8f5f-7a570bea23e6	buit67i	Mặc định	45000000.00	3	\N
5d7312fc-da7c-40cf-94f4-34eaa761e3cc	600a9046-2e76-4070-bb44-3f8042af6c44	gy7gt6	Mặc định	11000000.00	32	\N
b0c9a570-1c3f-46f6-ab32-2bdd0f7adfb5	e84a6278-a906-4b6d-8d7d-05a919923b37	SKU-W54737PA	Mặc định	4158238.00	67	\N
5c03a52e-883d-413d-95d2-17e98ea117f8	e84a6278-a906-4b6d-8d7d-05a919923b37	SKU-OOZ8PA59	Bản Cao Cấp	7754360.00	13	\N
7a423abb-2426-41d3-90e4-e9f629c44eaa	071f40e6-c400-4f01-a1c6-cf0d93cec0e5	yufty7t89g	Mặc định	690000.00	45	\N
87c3dbbc-f474-40b4-a92b-182711789bff	f7b1cd79-08af-49f5-93c1-ae83c32977b9	gytdcr656c	Mặc định	56000000.00	5	\N
8993d6e1-03bb-4f85-b93e-5a5ffd7a7582	e9359b5f-7db9-4f18-aefd-a8695f2e413d	6uf88	Mặc định	24990000.00	36	\N
62f7a9bd-9cf6-41b7-8150-dc9be23753c0	93dc4b66-f386-42a1-9dfb-9cb8f484e11a	uioh67fy	Mặc định	2290000.00	10	\N
242d7feb-d95d-4b3c-a48d-fd8295cb8fa1	85edf011-cdf4-4c3d-a079-e16cea300cca	hhuh561	Mặc định	25000000.00	3	\N
0fe9c773-1d95-4174-a708-d08d3a191113	cf10d9f9-baaf-4f87-8dd6-135fcf9fb129	gy8tg99	Mặc định	79685.00	78	\N
fd9f3d9a-1038-4ecf-954f-7adb10545cf0	ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9	guy6f7	Mặc định	16800000.00	15	\N
9ad1874f-1c1e-4fb8-accf-73bc1120c539	796e9a56-15cc-4714-bb85-e3d6c1f91683	fhu78g	Mặc định	10890000.00	45	\N
c1847e2c-f283-4aa1-b5cf-1dd6fa09f47e	9251db4c-b9bf-474d-bf4a-b8b2971f1067	mayguv88	Mặc định	5690000.00	12	\N
d9a8dc8e-fd1a-4f12-8f19-5b19afa18776	da43852a-66b7-4c5d-a92b-812c6b985327	sder34d	Mặc định	2190000.00	18	\N
edf5e5f6-3100-4ec5-a65f-ba4d9f5a1253	db4dc78a-a17c-4b70-9e3e-0d48594194e6	tuyguu677s	Mặc định	11990000.00	12	\N
5535050f-2add-409e-903d-1251f91bbb5c	9abc6cdf-d54b-4b24-9ccf-832628adeeff	SKU-5OKLUEPL	Mặc định	4025426.00	83	\N
c2d09b1a-ce71-4bcc-b94d-b949564abf15	9abc6cdf-d54b-4b24-9ccf-832628adeeff	SKU-PPAJYTED	Bản Cao Cấp	3140709.00	26	\N
9758d228-8723-464d-bc05-0d741bd63e81	26e5e622-39e9-4b92-8695-5844dfa9b2fe	SKU-9IZU2WCR	Mặc định	4869337.00	84	\N
c4ba3455-9f4d-4d75-9de8-bbe16bcc0e68	26e5e622-39e9-4b92-8695-5844dfa9b2fe	SKU-SRSXQICQ	Bản Cao Cấp	2055094.00	22	\N
059433d0-1763-44f9-ab89-1536450c9bc0	6a1989ce-70c3-475e-94c3-c276d7853dc3	SKU-GM9OBPDT	Mặc định	1220274.00	90	\N
edf4223d-fb34-42d5-a689-a742cd79a5d4	6a1989ce-70c3-475e-94c3-c276d7853dc3	SKU-AOFPBVMG	Bản Cao Cấp	4632762.00	25	\N
96dd6924-f95f-4b7f-9f5a-07b98695519f	2eca6f19-46e9-4d2c-9fe5-af77803038d9	SKU-J4PFKZ2H	Mặc định	4566036.00	177	\N
067a0997-51b6-4f73-985e-c199da1c3cda	2eca6f19-46e9-4d2c-9fe5-af77803038d9	SKU-LN5PBERA	Bản Cao Cấp	2891191.00	50	\N
02e559e0-76f5-4222-bbca-3f89df3f8e44	9b080ce0-dff0-4166-adfa-34e9eed7339a	SKU-RTC9JTNM	Mặc định	2971012.00	99	\N
e1686ef6-4dea-4697-9aa8-cb8eaa1b79ea	9b080ce0-dff0-4166-adfa-34e9eed7339a	SKU-EDKCQBHI	Bản Cao Cấp	8394737.00	39	\N
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."RefreshToken" (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Review" (id, "userId", "productId", rating, comment, "createdAt") FROM stdin;
\.


--
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."SupportTicket" (id, "userId", subject, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TicketMessage; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."TicketMessage" (id, "ticketId", "senderId", content, "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."User" (id, name, email, password, role, avatar, "isActive", "createdAt", "updatedAt") FROM stdin;
a05fdfd0-bb7f-4435-98cf-7609ecf33b5b	Admin UltraShop	admin@ultrashop.com	$2a$10$lqkjfMNpisx/J51BCkwgve7VKs5NSjGXqRgiao24Wa3.R8vyYVJES	ADMIN	https://i.pravatar.cc/150?u=admin	t	2026-05-20 07:06:05.915	2026-05-20 07:06:05.915
ce00b000-f3c5-431e-b240-1218037da648	Thanh Thuận Phùng	7kinhduong55@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/90370772	t	2026-05-20 07:06:05.956	2026-05-20 07:06:05.956
3d651d43-eac9-445a-b6b3-ee02ad85b512	Gia Đạo Đỗ	7kucduy_trinh@yahoo.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/28.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
b05028d4-4417-4727-a2e5-8c2371306cd3	Tú Quyên Phạm	syphu65@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/70513055	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
208734dc-901b-41b7-8fe6-54f76c4bf91c	Nhật Nam Đỗ	dieunga77@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/20853573	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
abf66f5b-6e47-4445-a0fb-3b20aaa78e0c	Vân Nhi Bùi	thuynga_ly66@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/17660487	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
00776389-2ab9-4efb-b0f4-18f69bb7dc78	Trọng Trí Vương	haivy80@yahoo.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/57116042	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
1e6830e9-6027-499d-9f99-bbdfe76479c3	Phượng Long Vương	haiphong_pham@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/73563989	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
a145ecb4-dc54-46c5-992b-359fc1b079cc	Lệ Băng Nguyễn	thieuly87@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/9749110	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
ad50738b-0c89-413d-b826-1694d9cbde73	Thúy Hường Hoàng	hanhtrang_vu@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/57987632	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
e8aa61fc-a892-480d-b93d-7dec830e9526	Hải Nam Lê	xuanngoc3@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/38214359	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
2c30fe59-c287-4d3a-b3e1-c09f6936b338	Thiện Phước Trương	quocthien_truong@yahoo.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/3.jpg	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
08053cad-fcce-401b-8989-73e0a0b420c4	Thảo Mai Mai	huongxuan.7kang@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/45.jpg	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
14e9cd12-ad94-4420-9ab8-9d0a324284a6	Tuấn Đức Phan	viethuong92@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/35.jpg	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
d9294a70-662a-4ac3-bf6a-3315d7384ea1	Quang Thái Đinh	hoangxuan_ha@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/99.jpg	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
cc36173e-5ff1-47a2-bd5b-704a4e8523e4	Hướng Bình Đoàn	xuanthanh.tang@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/64559280	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
6d9aae79-2172-4c6e-9b06-7fb688e7ef26	Uyên Minh Dương	nguyetque77@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/1758540	t	2026-05-20 07:06:05.958	2026-05-20 07:06:05.958
a9cd603c-acf0-48b4-86df-ce822dedd31a	Minh Kiệt Trần	thephuong51@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/36.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
5bfce06a-1aa2-4f3d-b68d-9c87612ada8d	Quỳnh Hoa Hà	luongtuyen1@yahoo.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/79065021	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
b784b603-ea06-48bb-a5c0-f68f1499d331	Hồng Đăng Vũ	quangvinh.tran@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/24323468	t	2026-05-20 07:06:05.956	2026-05-20 07:06:05.956
ad76e690-1e14-4340-bb82-0a177b93d558	Trí Liên Vương	ailinh.pham@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/517041	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
90b2a1d7-109e-4aa9-9bc8-4e25f0758d01	Tôn Lễ Tăng	thaolinh92@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/20260162	t	2026-05-20 07:06:05.956	2026-05-20 07:06:05.956
b1d53096-a600-43d3-8000-66568b586693	Thanh Hồng Trịnh	thuongthuat63@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/24505086	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
540c29f8-c5cf-468f-92b0-7382e9a42c1c	Quang Huy Hoàng	trungnhan68@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/32.jpg	t	2026-05-20 07:06:05.956	2026-05-20 07:06:05.956
79748d27-c7a4-468f-b0a8-1fa50895f510	Đông Sơn Trần	danhiep_le59@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/83.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
42ace291-6954-45bd-aa56-dd4e80f32aff	Nguyên Khang Hồ	haian.pham@yahoo.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/66.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
ef3d3c28-bf87-45e7-9915-af9b3b069849	Bảo Trân Mai	huukhoat28@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/38857378	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
133431c3-2de6-4569-bfbb-829cb09dcce6	Ngọc Loan Phan	lienphuong46@yahoo.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/66622392	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
0db93408-c030-47de-a5ec-29951bb7a933	Kim Trang Hoàng	congthanh.duong@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/99.jpg	t	2026-05-20 07:06:05.956	2026-05-20 07:06:05.956
0fca0d53-0618-4c94-9c00-ab9473663923	Lập Thành Hoàng	baophuong24@yahoo.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/16.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
01fb0885-c61b-4813-8059-8829f52c59d1	Ngọc Uyển Đoàn	kimtuyet.pham32@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/30.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
918fdda5-4b4c-4eae-954c-3d2e1c07e199	Công Bằng Lý	trongduy_truong@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/89.jpg	t	2026-05-20 07:06:05.956	2026-05-20 07:06:05.956
d3cd34c3-142a-4936-bd97-f07cb87d8f36	Hiếu Nghĩa Lâm	giangngoc_duong@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/69.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
c1e5b54c-9383-497d-8aca-4e0bb4859cfe	Bách Nhân Trần	monglong_to@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/34.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
0e555237-a97f-4c66-8d02-b2118dcfdbf9	Trang Nhã Mai	dungviet62@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/1858636	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
468fbcfc-4572-418f-b4e9-678d86bf42fc	Bạch Tuyết Trịnh	huulong.7koan@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/51949361	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
fc8fed6c-9510-4a20-a380-a69fa4ffd1c2	Quý Khánh Đào	hieuminh_lam12@yahoo.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/78288968	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
3e381d11-e487-4943-a65c-9eab882060e1	Linh Duyên Đào	tuelam.7kang17@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://avatars.githubusercontent.com/u/89543873	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
5d217592-20b4-4aa3-a9ed-adec1c8beedd	Bảo Trâm Đào	trunghai.vu31@gmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/73.jpg	t	2026-05-20 07:06:05.956	2026-05-20 07:06:05.956
6f35a644-4e28-478a-9225-45bbfb6830dd	Loan Châu Lê	ngoctho10@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/31.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
36b9da24-5480-4a54-bb8f-5c54cf3264ae	Văn Định	admin@gmail.com	$2a$12$5OtKrPSxfMlRW9.JTmXbTOyyr/lgLIhI2K0vjXj0kr27Ibra8DxDy	ADMIN	\N	t	2026-05-20 07:41:16.934	2026-05-20 07:41:35.562
69a87fe2-5f3f-4ab8-a09b-19c472c0f789	Test	as1@gmail.com	$2a$12$CS16M4vg.TCkxm.Cgj5FPuHNmx7o1KnApWwiku0cx5Up7JsnF9iSu	USER	\N	t	2026-05-21 04:24:45.892	2026-05-21 04:24:45.892
73a96901-120c-45e0-bf06-9c42f9ce29aa	Bích Ngọc Hồ	minhhien71@hotmail.com	$2a$10$N1NM4C8qhLsaakHTazTFRO0sTF2PJFvQb5.ef0EtUSajMYa293xD2	USER	https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/72.jpg	t	2026-05-20 07:06:05.957	2026-05-20 07:06:05.957
\.


--
-- Data for Name: UserBehavior; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."UserBehavior" (id, "userId", "productId", type, "createdAt") FROM stdin;
01c115dc-b77e-482c-b791-43981882b41f	90b2a1d7-109e-4aa9-9bc8-4e25f0758d01	9abc6cdf-d54b-4b24-9ccf-832628adeeff	SEARCH	2026-05-20 07:06:12.921
b8a16d8f-1e9b-477e-a926-9bf1ebd96f53	e8aa61fc-a892-480d-b93d-7dec830e9526	9b080ce0-dff0-4166-adfa-34e9eed7339a	VIEW	2026-05-20 07:06:12.926
1d739b61-c89c-485e-be62-b40cdc4b0556	133431c3-2de6-4569-bfbb-829cb09dcce6	2eca6f19-46e9-4d2c-9fe5-af77803038d9	VIEW	2026-05-20 07:06:13.025
\.


--
-- Data for Name: Voucher; Type: TABLE DATA; Schema: public; Owner: tmdt_user
--

COPY public."Voucher" (id, code, "discountType", "discountValue", "minOrderValue", "maxDiscount", "startDate", "endDate", "usageLimit", "usedCount", "categoryId", "isActive", "createdAt", "updatedAt", "productId") FROM stdin;
44b76318-9e32-44ab-b144-f47eb20084c2	CHAOMUNG	PERCENT	100.00	100000.00	\N	2026-04-20 00:00:00	2026-04-27 00:00:00	5	2	\N	t	2026-04-20 21:13:23.881	2026-04-23 04:03:18.007	\N
c1bde6c9-7af0-4519-ab3c-4a0152da07d0	CUOITUAN	PERCENT	60.00	1000000.00	\N	2026-04-23 00:00:00	2026-04-28 00:00:00	2	1	\N	t	2026-04-21 00:44:00.555	2026-04-23 11:00:15.615	\N
\.


--
-- Name: ActivityLog ActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY (id);


--
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: GlobalNotification GlobalNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."GlobalNotification"
    ADD CONSTRAINT "GlobalNotification_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductAttribute ProductAttribute_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ProductAttribute"
    ADD CONSTRAINT "ProductAttribute_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- Name: TicketMessage TicketMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_pkey" PRIMARY KEY (id);


--
-- Name: UserBehavior UserBehavior_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."UserBehavior"
    ADD CONSTRAINT "UserBehavior_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Voucher Voucher_pkey; Type: CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Voucher"
    ADD CONSTRAINT "Voucher_pkey" PRIMARY KEY (id);


--
-- Name: ActivityLog_action_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ActivityLog_action_idx" ON public."ActivityLog" USING btree (action);


--
-- Name: ActivityLog_createdAt_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ActivityLog_createdAt_idx" ON public."ActivityLog" USING btree ("createdAt");


--
-- Name: ActivityLog_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ActivityLog_userId_idx" ON public."ActivityLog" USING btree ("userId");


--
-- Name: Banner_isActive_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Banner_isActive_idx" ON public."Banner" USING btree ("isActive");


--
-- Name: Cart_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Cart_userId_idx" ON public."Cart" USING btree ("userId");


--
-- Name: Cart_userId_productVariantId_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "Cart_userId_productVariantId_key" ON public."Cart" USING btree ("userId", "productVariantId");


--
-- Name: Category_slug_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Category_slug_idx" ON public."Category" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: ChatMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ChatMessage_createdAt_idx" ON public."ChatMessage" USING btree ("createdAt");


--
-- Name: ChatMessage_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ChatMessage_userId_idx" ON public."ChatMessage" USING btree ("userId");


--
-- Name: GlobalNotification_createdAt_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "GlobalNotification_createdAt_idx" ON public."GlobalNotification" USING btree ("createdAt");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: Payment_createdAt_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Payment_createdAt_idx" ON public."Payment" USING btree ("createdAt");


--
-- Name: Payment_orderId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Payment_orderId_idx" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: ProductAttribute_key_value_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ProductAttribute_key_value_idx" ON public."ProductAttribute" USING btree (key, value);


--
-- Name: ProductAttribute_productId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ProductAttribute_productId_idx" ON public."ProductAttribute" USING btree ("productId");


--
-- Name: ProductAttribute_productId_key_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "ProductAttribute_productId_key_key" ON public."ProductAttribute" USING btree ("productId", key);


--
-- Name: ProductImage_productId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ProductImage_productId_idx" ON public."ProductImage" USING btree ("productId");


--
-- Name: ProductVariant_productId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ProductVariant_productId_idx" ON public."ProductVariant" USING btree ("productId");


--
-- Name: ProductVariant_sku_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "ProductVariant_sku_idx" ON public."ProductVariant" USING btree (sku);


--
-- Name: ProductVariant_sku_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "ProductVariant_sku_key" ON public."ProductVariant" USING btree (sku);


--
-- Name: Product_slug_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Product_slug_idx" ON public."Product" USING btree (slug);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: Review_productId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Review_productId_idx" ON public."Review" USING btree ("productId");


--
-- Name: Review_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "Review_userId_idx" ON public."Review" USING btree ("userId");


--
-- Name: SupportTicket_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "SupportTicket_userId_idx" ON public."SupportTicket" USING btree ("userId");


--
-- Name: TicketMessage_ticketId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "TicketMessage_ticketId_idx" ON public."TicketMessage" USING btree ("ticketId");


--
-- Name: UserBehavior_productId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "UserBehavior_productId_idx" ON public."UserBehavior" USING btree ("productId");


--
-- Name: UserBehavior_type_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "UserBehavior_type_idx" ON public."UserBehavior" USING btree (type);


--
-- Name: UserBehavior_userId_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "UserBehavior_userId_idx" ON public."UserBehavior" USING btree ("userId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Voucher_code_key; Type: INDEX; Schema: public; Owner: tmdt_user
--

CREATE UNIQUE INDEX "Voucher_code_key" ON public."Voucher" USING btree (code);


--
-- Name: ActivityLog ActivityLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Cart Cart_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Cart Cart_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatMessage ChatMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Voucher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductAttribute ProductAttribute_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ProductAttribute"
    ADD CONSTRAINT "ProductAttribute_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportTicket SupportTicket_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketMessage TicketMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TicketMessage TicketMessage_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserBehavior UserBehavior_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."UserBehavior"
    ADD CONSTRAINT "UserBehavior_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserBehavior UserBehavior_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tmdt_user
--

ALTER TABLE ONLY public."UserBehavior"
    ADD CONSTRAINT "UserBehavior_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict pdgfGwAfEdLJ4eusSX39x5YYSKPMLH0qn7IEkY1quGWezNHuznph5eLbM7N8TvS

