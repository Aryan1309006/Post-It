import { createContext, useContext, useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { api, formDataOptions } from "./api.js";

const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const data = await api("/api/auth/me");
      setUser(data.user);
      return data;
    } catch (error) {
      if (error.message !== "Authentication required") {
        throw error;
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser().catch((error) => {
      console.error(error);
      setLoading(false);
    });
  }, []);

  async function login(credentials) {
    const data = await api("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    setUser(data.user);
  }

  async function register(details) {
    const data = await api("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    setUser(data.user);
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white/90">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900" to="/">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-lg text-white">P</span>
          Post-It
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold">
          {user ? (
            <>
              <Link className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100" to="/profile">
                My posts
              </Link>
              <Link className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100" to="/explore">
                Explore
              </Link>
              <button className="button-secondary" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="px-3 py-2 text-slate-600 hover:text-indigo-600" to="/login">Log in</Link>
              <Link className="button-primary" to="/register">Get started</Link>
            </>
          )}
        </div>
      </nav>
      {error && <p className="mx-auto max-w-6xl px-5 pb-3 text-sm text-red-600">{error}</p>}
    </header>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function Loading() {
  return <div className="grid min-h-screen place-items-center text-sm font-medium text-slate-500">Loading Post-It...</div>;
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (user) return <Navigate to="/profile" replace />;

  return (
    <PageShell>
      <main className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-24 pt-20 text-center sm:pt-28">
        <span className="mb-6 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
          A little space for your big ideas
        </span>
        <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
          Your thoughts deserve to be <span className="text-indigo-600">shared.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Write a post, add a photo, and discover what everyone else is saying. Simple, personal, and all yours.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link className="button-primary px-6 py-3 text-base" to="/register">Start writing <span aria-hidden="true">→</span></Link>
          <Link className="button-secondary px-6 py-3 text-base" to="/explore">Explore the feed</Link>
        </div>
        <div className="mt-16 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3">
          {[
            ["01", "Write freely", "Turn a passing thought into a post worth sharing."],
            ["02", "Add a moment", "Bring your stories to life with an image."],
            ["03", "Find your people", "Explore posts and join the conversation."],
          ].map(([number, title, copy]) => (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={number}>
              <span className="text-sm font-bold text-indigo-600">{number}</span>
              <h2 className="mt-3 text-lg font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
}

function AuthPage({ mode }) {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  if (loading) return <Loading />;
  if (user) return <Navigate to="/profile" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const fields = Object.fromEntries(form.entries());

    try {
      if (isRegister) await register(fields);
      else await login(fields);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <main className="mx-auto flex max-w-lg justify-center px-5 py-16">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-600 text-xl font-black text-white">P</div>
            <h1 className="mt-5 text-2xl font-black text-slate-900">{isRegister ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isRegister ? "Join the conversation and start sharing." : "Log in to pick up where you left off."}</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && <Field label="Your name" name="name" placeholder="Alex Morgan" />}
            <Field label="Email address" name="email" placeholder="you@example.com" type="email" />
            <Field label="Password" name="password" placeholder="Enter your password" type="password" />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="button-primary w-full justify-center py-3" disabled={busy}>
              {busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? "Already have an account?" : "New to Post-It?"}{" "}
            <Link className="font-bold text-indigo-600 hover:text-indigo-700" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
        </section>
      </main>
    </PageShell>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input className="form-input mt-2" required {...props} />
    </label>
  );
}

function FeedLayout({ children, title, description }) {
  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Post-It community</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>
        {children}
      </main>
    </PageShell>
  );
}

function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadPosts() {
    const data = await api("/api/auth/me");
    setPosts(data.posts);
  }

  useEffect(() => {
    loadPosts().catch((err) => setError(err.message));
  }, []);

  async function createPost(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = event.currentTarget;
    try {
      const body = new FormData(form);
      await api("/api/posts", formDataOptions(body));
      form.reset();
      await loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id) {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api(`/api/posts/${id}`, { method: "DELETE" });
      setPosts((current) => current.filter((post) => post._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleLike(id) {
    try {
      const { post } = await api(`/api/posts/${id}/like`, { method: "POST" });
      setPosts((current) => current.map((item) => item._id === id ? post : item));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <FeedLayout title={`Hello, ${user.name}`} description="Share a thought or a moment with the community.">
      <form className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={createPost}>
        <label className="block text-sm font-bold text-slate-800" htmlFor="post-content">What’s on your mind?</label>
        <textarea className="form-input mt-3 min-h-28 resize-y" id="post-content" name="content" placeholder="Write something worth sharing..." required />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <input className="block max-w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200" type="file" name="image" accept="image/*" />
          <button className="button-primary" disabled={busy}>{busy ? "Posting..." : "Share post"}</button>
        </div>
      </form>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="space-y-4">
        {posts.length ? posts.map((post) => (
          <PostCard key={post._id} post={post} own onLike={toggleLike} onDelete={deletePost} />
        )) : <EmptyState title="Your feed starts here" copy="Write your first post and it will show up here." />}
      </div>
    </FeedLayout>
  );
}

function Explore() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  async function loadPosts() {
    const data = await api("/api/posts/explore");
    setPosts(data.posts);
  }

  useEffect(() => {
    loadPosts().catch((err) => setError(err.message));
  }, []);

  async function toggleLike(id) {
    try {
      const { post } = await api(`/api/posts/${id}/like`, { method: "POST" });
      setPosts((current) => current.map((item) => item._id === id ? post : item));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <FeedLayout title="Explore" description="Fresh thoughts and moments shared by the community.">
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="space-y-4">
        {posts.length ? posts.map((post) => (
          <PostCard key={post._id} post={post} onLike={toggleLike} />
        )) : <EmptyState title="Nothing to explore yet" copy="Check back soon for new posts from the community." />}
      </div>
    </FeedLayout>
  );
}

function PostCard({ post, own = false, onLike, onDelete }) {
  const { user } = useAuth();
  const liked = post.likes.some((id) => (typeof id === "string" ? id : id._id) === user?._id);
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {(post.user?.name || "P").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-bold text-slate-900">{post.user?.name || "Post-It member"}</h2>
              <p className="text-xs text-slate-500">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</p>
            </div>
          </div>
          {own && <Link className="text-sm font-semibold text-indigo-600 hover:text-indigo-700" to={`/posts/${post._id}/edit`}>Edit</Link>}
        </div>
        {post.imageUrl && <img className="mt-5 max-h-[28rem] w-full rounded-xl object-cover" src={post.imageUrl} alt="Post attachment" />}
        <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">{post.content}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <button className={`rounded-lg px-3 py-2 text-sm font-bold ${liked ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600"}`} onClick={() => onLike(post._id)}>
            {liked ? "♥" : "♡"} <span className="ml-1">{post.likes.length}</span>
          </button>
          {own && <button className="text-sm font-semibold text-slate-500 hover:text-red-600" onClick={() => onDelete(post._id)}>Delete post</button>}
        </div>
      </div>
    </article>
  );
}

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/posts/${id}`)
      .then(({ post: current }) => setPost(current))
      .catch((err) => setError(err.message));
  }, [id]);

  async function savePost(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api(`/api/posts/${id}`, formDataOptions(new FormData(event.currentTarget), "PUT"));
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FeedLayout title="Edit your post" description="Make a change, then share it with the community.">
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!post ? (error ? <Link className="font-semibold text-indigo-600" to="/profile">Back to your posts</Link> : <Loading />) : (
        <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={savePost}>
          <label className="block text-sm font-bold text-slate-800" htmlFor="edit-content">Post content</label>
          <textarea className="form-input mt-3 min-h-40 resize-y" id="edit-content" name="content" defaultValue={post.content} required />
          {post.imageUrl && <img className="mt-4 max-h-80 w-full rounded-xl object-cover" src={post.imageUrl} alt="Current post attachment" />}
          <label className="mt-5 block text-sm font-semibold text-slate-700">
            Replace image
            <input className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-semibold file:text-slate-700" type="file" name="image" accept="image/*" />
          </label>
          <div className="mt-6 flex gap-3">
            <button className="button-primary" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button>
            <Link className="button-secondary" to="/profile">Cancel</Link>
          </div>
        </form>
      )}
    </FeedLayout>
  );
}

function EmptyState({ title, copy }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">✦</div>
      <h2 className="mt-4 font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{copy}</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/posts/:id/edit" element={<EditPost />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
