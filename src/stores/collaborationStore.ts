import {
  createSync,
  getRandomColor,
  getRandomUsername,
} from "@/lib/collaboration";
import {
  CollaborationMode,
  Cursor,
  Message,
  messageSchema,
  User,
} from "@/types/Collaboration";
import { Diagram } from "@/types/Diagram";
import Peer, { DataConnection, PeerOptions } from "peerjs";
import { createStore, StoreApi } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAppStore } from "./appStore";
import { getIceServers } from "@/actions/ice";

const getPeerOptions = async (): Promise<PeerOptions> => {
  let iceServers: RTCIceServer[] = [];

  try {
    iceServers = await getIceServers();
  } catch (error) {
    console.log({ error });
  }

  return {
    debug: 3,
    config: {
      iceServers,
    },
  };
};

export interface CollaborationStore {
  isGuest: boolean;

  peer: Peer | null;
  state: "connecting" | "connected" | "disconnected" | "error";
  roomId: string | null;

  user: User | null;
  users: Record<string, User>;
  mode: CollaborationMode;
  diagram: Diagram | null;

  setUser: (newUser: User) => void;
  setUserCursor: (cursor: Cursor) => void;
  setMode: (newMode: CollaborationMode) => void;

  start: () => void;
  stop: () => void;
}

type Props =
  | {
      isGuest: true;
      roomId: string;
    }
  | {
      isGuest: false;
    };

const createCollaborationStoreInternal = (
  props: Props,
): StoreApi<CollaborationStore> => {
  const store = createStore<CollaborationStore>()(
    subscribeWithSelector((set) => ({
      isGuest: !!props.isGuest,

      peer: null,
      state: "disconnected",
      roomId: props.isGuest ? props.roomId : null,

      user: null,
      users: {},
      mode: CollaborationMode.READ,
      diagram: null,
      setUser: (newUser) => set({ user: newUser }),
      setUserCursor: (cursor) =>
        set((state) => {
          if (!state.user) return {};

          return {
            user: {
              ...state.user,
              cursor,
            },
          };
        }),
      setMode: (newMode) => set({ mode: newMode }),
      start: async () => {
        if (props.isGuest) {
          store.setState({
            peer: new Peer(await getPeerOptions()),
            state: "connecting",
          });

          return;
        }

        set({
          peer: new Peer(await getPeerOptions()),
          state: "connecting",
          user: {
            username: localStorage.getItem("username") || getRandomUsername(),
            color: getRandomColor(),
            cursor: {
              x: 0,
              y: 0,
            },
          },
        });
      },
      stop: () => {
        set((state) => {
          if (state.peer) {
            state.peer.destroy();
          }

          return {
            peer: null,
            state: "disconnected",
            user: null,
            users: {},
            mode: CollaborationMode.READ,
            diagram: null,
          };
        });
      },
    })),
  );

  if (props.isGuest) {
    const handleOpen = () => {
      const state = store.getState();
      const peer = state.peer as Peer;

      const connection = peer.connect(props.roomId);

      connection.on("open", () => {
        const newUser = {
          username: localStorage.getItem("username") || getRandomUsername(),
          color: getRandomColor(),
          cursor: { x: 0, y: 0 },
        };

        store.setState({
          state: "connected",
          user: newUser,
        });

        connection.send({
          type: "join",
          user: newUser,
        } satisfies Message);
      });

      connection.on("close", () => {
        store.setState({
          state: "disconnected",
        });
      });

      connection.on("data", (d) => {
        const { success, data } = messageSchema.safeParse(d);

        if (!success) {
          console.warn("Invalid message", d);
          return;
        }

        if (data.type === "sync") {
          const newUsers = data.users;
          delete newUsers[peer.id];

          store.setState({
            diagram: data.diagram,
            users: newUsers,
            mode: data.mode,
          });
        }

        if (data.type === "syncMode") {
          store.setState({
            mode: data.mode,
          });
        }

        if (data.type === "syncDiagram") {
          store.setState({
            diagram: data.diagram,
          });
        }

        if (data.type === "syncUsers") {
          const newUsers = data.users;
          delete newUsers[peer.id];

          store.setState({
            users: newUsers,
          });
        }
      });

      const { sync } = createSync<User>({
        syncFn: (user) => {
          connection.send({
            type: "user",
            user,
          } satisfies Message);
        },
        updatesPerSecond: 10,
      });

      store.subscribe(
        (s) => s.user,
        (user) => {
          if (!user) {
            return;
          }

          sync(user);
        },
      );
    };

    store.subscribe(
      (s) => s.peer,
      (peer) => {
        if (!peer) {
          return;
        }
        peer.on("open", handleOpen);
        peer.on("error", () => {
          store.setState({
            state: "error",
          });
        });
      },
    );
  } else {
    const connections: Map<string, DataConnection> = new Map();
    const timers: Map<string, NodeJS.Timeout> = new Map();

    const emit = (c: DataConnection, msg: Message) => {
      c.send(msg);
    };

    const broadcast = (msg: Message) => {
      connections.forEach((c) => {
        c.send(msg);
      });
    };

    const handleOpen = () => {
      const state = store.getState();
      const peer = state.peer as Peer;

      store.setState({
        state: "connected",
        roomId: peer.id,
      });
    };

    const handleConnection = (connection: DataConnection) => {
      connections.set(connection.peer, connection);

      connection.on("data", (d) => {
        const { success, data } = messageSchema.safeParse(d);

        if (!success) {
          console.warn("Invalid message", d);
          return;
        }

        if (timers.has(connection.peer)) {
          clearTimeout(timers.get(connection.peer));
        }

        timers.set(
          connection.peer,
          setTimeout(
            () => {
              connection.close();
            },
            1000 * 60 * 2,
          ),
        );

        if (data.type === "join") {
          const state = store.getState();

          if (!state.diagram) {
            return;
          }

          const newUsers = {
            ...state.users,
            [connection.peer]: data.user,
          };

          store.setState({
            users: newUsers,
          });

          emit(connection, {
            type: "sync",
            mode: state.mode,
            diagram: state.diagram,
            users: newUsers,
          });
        }

        if (data.type === "user") {
          const state = store.getState();

          const newUsers = {
            ...state.users,
            [connection.peer]: data.user,
          };

          store.setState({
            users: newUsers,
          });
        }
      });

      connection.on("close", () => {
        connections.delete(connection.peer);
        const newUsers = { ...store.getState().users };
        delete newUsers[connection.peer];

        store.setState({
          users: newUsers,
        });
      });
    };

    store.subscribe(
      (s) => s.peer,
      (peer) => {
        if (!peer) {
          return;
        }

        peer.on("open", handleOpen);
        peer.on("connection", handleConnection);
      },
    );

    const { sync, getLastData } = createSync<{
      users?: Record<string, User>;
      diagram?: Diagram;
    }>({
      syncFn: ({ users, diagram }) => {
        if (users && diagram) {
          broadcast({
            type: "sync",
            users,
            diagram,
            mode: CollaborationMode.READ,
          });
        } else if (users) {
          broadcast({
            type: "syncUsers",
            users,
          });
        } else if (diagram) {
          broadcast({
            type: "syncDiagram",
            diagram,
          });
        }
      },
      updatesPerSecond: 10,
    });

    const syncUsers = () => {
      const { user, users, peer } = store.getState();

      if (!user || !peer) {
        return;
      }

      const newUsers = {
        ...users,
        [peer.id]: user,
      };

      sync({
        ...getLastData(),
        users: newUsers,
      });
    };

    store.subscribe(
      (s) => s.users,
      () => {
        syncUsers();
      },
    );

    store.subscribe(
      (s) => s.user,
      () => {
        syncUsers();
      },
    );

    store.subscribe(
      (s) => s.mode,
      (mode) => {
        broadcast({
          type: "syncMode",
          mode,
        });
      },
    );

    store.subscribe(
      (s) => s.diagram,
      (diagram) => {
        if (!diagram) {
          return;
        }

        sync({
          ...getLastData(),
          diagram,
        });
      },
    );

    useAppStore.subscribe(
      (s) => s,
      ({ currentDiagram, diagrams }) => {
        store.setState({
          diagram: (currentDiagram && diagrams[currentDiagram]) || null,
        });
      },
    );
  }

  return store;
};

const createCachedStore = () => {
  let collaborationStore: StoreApi<CollaborationStore> | null = null;

  return (props: Props) => {
    if (!collaborationStore) {
      collaborationStore = createCollaborationStoreInternal(props);
    }

    return collaborationStore;
  };
};

const cachedStore = createCachedStore();

export const createCollaborationStore = (props: Props) => cachedStore(props);
