import { type ReactNode, useEffect } from "react";
import { ClerkProvider, RedirectToSignIn, Show, SignIn, SignUp, useAuth, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Sparkles } from "lucide-react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Redirect, Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import Budget from "@/pages/budget";
import Insights from "@/pages/insights";
import Reports from "@/pages/reports";
import Copilot from "@/pages/copilot";
import Alerts from "@/pages/alerts";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

function Landing() {
  const [, setLocation] = useLocation();
  return (
    <main className="flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#0f2828] px-5 py-12 text-white">
      <div className="relative w-full max-w-5xl">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#6fc0a7]/20 blur-3xl" />
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="mb-8 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#b9e7d2] text-[#0f2828]"><span className="text-lg font-black">$</span></span><span className="text-xl font-bold tracking-tight">CloudSpend</span></div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#b9e7d2]">Money, made clearer</p>
            <h1 className="max-w-xl text-5xl font-extrabold leading-[.98] tracking-[-0.06em] sm:text-7xl">Your spending has a story. Let’s make it useful.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/65">A private, intelligent space to track expenses, set a plan, and ask better questions about your money.</p>
            <div className="mt-9 flex flex-wrap gap-3"><button type="button" onClick={() => setLocation("/sign-up")} className="rounded-2xl bg-[#b9e7d2] px-5 py-3.5 text-sm font-bold text-[#0f2828] transition-transform hover:-translate-y-0.5">Create free account</button><button type="button" onClick={() => setLocation("/sign-in")} className="rounded-2xl border border-white/20 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/10">Sign in</button></div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[.06] p-5 shadow-2xl backdrop-blur-xl">
            <div className="rounded-[1.4rem] bg-[#f5f8f5] p-5 text-[#102d2d]">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#548276]">CloudSpend snapshot</p><p className="mt-2 text-3xl font-extrabold tracking-tight">$18,420</p></div><span className="rounded-full bg-[#d9f0e3] px-2.5 py-1 text-[10px] font-bold text-[#28735b]">12% under plan</span></div>
              <div className="mt-7 flex h-36 items-end gap-2">{[38, 52, 42, 67, 55, 74, 62, 82, 68, 92, 79, 98].map((height, index) => <div key={index} className="flex-1 rounded-t-lg bg-[#8bcab0]" style={{ height: `${height}%`, opacity: index > 8 ? .95 : .55 }} />)}</div>
              <div className="mt-6 flex items-center justify-between border-t border-[#dce9e1] pt-4 text-xs"><span className="text-[#6f8580]">Your month, at a glance</span><span className="font-bold text-[#28735b]">Live insight</span></div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#b9e7d2]/10 p-4 text-sm text-white/75"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#b9e7d2]/20 text-[#b9e7d2]"><Sparkles className="h-4 w-4" /></span><span>“Your Food spending is trending down. Nice work keeping the plan realistic.”</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AuthPages() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <Switch>
        <Route path="/sign-in/*?"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></Route>
        <Route path="/sign-up/*?"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></Route>
      </Switch>
    </div>
  );
}

function SessionSync() {
  const { user } = useUser();
  if (user?.id && typeof window !== "undefined") window.localStorage.setItem("cloudspend_username", user.id);
  return null;
}

function CacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  useEffect(() => addListener(() => client.clear()), [addListener, client]);
  return null;
}

function Protected({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-background" />;
  if (!isSignedIn) return <RedirectToSignIn />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/"><Show when="signed-in"><Redirect to="/dashboard" /></Show><Show when="signed-out"><Landing /></Show></Route>
      <Route path="/sign-in/*?" component={AuthPages} />
      <Route path="/sign-up/*?" component={AuthPages} />
      <Route path="/dashboard"><Protected><Dashboard /></Protected></Route>
      <Route path="/expenses"><Protected><Expenses /></Protected></Route>
      <Route path="/budget"><Protected><Budget /></Protected></Route>
      <Route path="/insights"><Protected><Insights /></Protected></Route>
      <Route path="/reports"><Protected><Reports /></Protected></Route>
      <Route path="/copilot"><Protected><Copilot /></Protected></Route>
      <Route path="/alerts"><Protected><Alerts /></Protected></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function RoutedErrorBoundary() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><AppRoutes /></ErrorBoundary>;
}

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={{
        theme: shadcn,
        cssLayerName: "clerk",
        options: { logoPlacement: "inside", logoLinkUrl: basePath || "/", logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
        variables: { colorPrimary: "#2f8272", colorForeground: "#183b3a", colorMutedForeground: "#6b8580", colorBackground: "#f7faf8", colorInput: "#ffffff", colorInputForeground: "#183b3a", colorNeutral: "#dce9e1", fontFamily: "Inter, sans-serif", borderRadius: "1rem" },
      }}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => window.history.pushState({}, "", stripBase(to))}
      routerReplace={(to) => window.history.replaceState({}, "", stripBase(to))}
    >
      <QueryClientProvider client={queryClient}>
        <SessionSync />
        <CacheInvalidator />
        <WouterRouter base={basePath}>
          <RoutedErrorBoundary />
        </WouterRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;