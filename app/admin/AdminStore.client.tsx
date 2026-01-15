"use client";

import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { AdminUser, PortalData } from "./_types";
import type { Appointment, HospitalRecord, Invoice, PatientProfile } from "../dashboard/_model";
import { makeId, makeProfile, seedPortalData, seedUsers } from "./_seed";

type AdminState = {
  users: AdminUser[];
  selectedUserId: string | null;
};

type Action =
  | { type: "seed"; users: AdminUser[]; selectFirst?: boolean }
  | { type: "createUser"; user: AdminUser; select?: boolean }
  | { type: "deleteUser"; id: string }
  | { type: "select"; id: string | null }
  | { type: "updateUserMeta"; id: string; patch: Partial<Pick<AdminUser, "fullName" | "email" | "phone" | "status" | "lastActiveISO">> }
  | { type: "replacePortal"; id: string; portal: PortalData }
  | { type: "updateProfile"; id: string; patch: Partial<PatientProfile> }
  | { type: "changePatientId"; oldId: string; newId: string }
  | { type: "upsertRecord"; id: string; record: HospitalRecord }
  | { type: "deleteRecord"; id: string; recordId: string }
  | { type: "upsertAppt"; id: string; appt: Appointment }
  | { type: "deleteAppt"; id: string; apptId: string }
  | { type: "upsertInvoice"; id: string; invoice: Invoice }
  | { type: "deleteInvoice"; id: string; invoiceId: string };

function upsertById<T extends { id: string }>(xs: T[], item: T): T[] {
  const idx = xs.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...xs];
  return xs.map((x) => (x.id === item.id ? item : x));
}

function removeById<T extends { id: string }>(xs: T[], id: string): T[] {
  return xs.filter((x) => x.id !== id);
}

function reducer(state: AdminState, action: Action): AdminState {
  switch (action.type) {
    case "seed": {
      const next = action.users;
      return {
        users: next,
        selectedUserId: action.selectFirst ? next[0]?.id ?? null : state.selectedUserId,
      };
    }
    case "createUser": {
      const next = [action.user, ...state.users];
      return {
        users: next,
        selectedUserId: action.select ? action.user.id : state.selectedUserId,
      };
    }
    case "deleteUser": {
      const next = state.users.filter((u) => u.id !== action.id);
      const selectedUserId = state.selectedUserId === action.id ? (next[0]?.id ?? null) : state.selectedUserId;
      return { users: next, selectedUserId };
    }
    case "select": {
      return { ...state, selectedUserId: action.id };
    }
    case "updateUserMeta": {
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.id ? { ...u, ...action.patch } : u)),
      };
    }
    case "replacePortal": {
      return {
        ...state,
        users: state.users.map((u) => {
          if (u.id !== action.id) return u;
          const p = action.portal.profile;
          return {
            ...u,
            fullName: p?.fullName ?? u.fullName,
            email: p?.email ?? u.email,
            phone: p?.phone ?? u.phone,
            portal: action.portal,
          };
        }),
      };
    }
    case "updateProfile": {
      return {
        ...state,
        users: state.users.map((u) => {
          if (u.id !== action.id) return u;
          const profile = u.portal.profile ? { ...u.portal.profile, ...action.patch } : { ...makeProfile(action.patch) };
          const portal = { ...u.portal, profile };
          return {
            ...u,
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            portal,
          };
        }),
      };
    }
    case "changePatientId": {
      const { oldId, newId } = action;
      if (!newId || oldId === newId) return state;
      if (state.users.some((u) => u.id === newId)) return state; // keep unique

      const users = state.users.map((u) => {
        if (u.id !== oldId) return u;
        const profile = u.portal.profile ? { ...u.portal.profile, patientId: newId } : null;
        const portal = { ...u.portal, profile };
        return { ...u, id: newId, portal };
      });
      const selectedUserId = state.selectedUserId === oldId ? newId : state.selectedUserId;
      return { users, selectedUserId };
    }
    case "upsertRecord": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id
            ? { ...u, portal: { ...u.portal, records: upsertById(u.portal.records, action.record) } }
            : u
        ),
      };
    }
    case "deleteRecord": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id
            ? { ...u, portal: { ...u.portal, records: removeById(u.portal.records, action.recordId) } }
            : u
        ),
      };
    }
    case "upsertAppt": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id ? { ...u, portal: { ...u.portal, appts: upsertById(u.portal.appts, action.appt) } } : u
        ),
      };
    }
    case "deleteAppt": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id ? { ...u, portal: { ...u.portal, appts: removeById(u.portal.appts, action.apptId) } } : u
        ),
      };
    }
    case "upsertInvoice": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id
            ? { ...u, portal: { ...u.portal, invoices: upsertById(u.portal.invoices, action.invoice) } }
            : u
        ),
      };
    }
    case "deleteInvoice": {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id
            ? { ...u, portal: { ...u.portal, invoices: removeById(u.portal.invoices, action.invoiceId) } }
            : u
        ),
      };
    }
    default:
      return state;
  }
}

type AdminActions = {
  seedDemo: (count: number, sizes?: { records?: number; appts?: number; invoices?: number }) => void;
  createBlankUser: () => void;
  createUserFromProfile: (p: Partial<PatientProfile>) => void;
  deleteUser: (id: string) => void;
  selectUser: (id: string | null) => void;

  updateUserMeta: (
    id: string,
    patch: Partial<Pick<AdminUser, "fullName" | "email" | "phone" | "status" | "lastActiveISO">>
  ) => void;

  updateProfile: (id: string, patch: Partial<PatientProfile>) => void;
  changePatientId: (oldId: string, newId: string) => void;
  replacePortal: (id: string, portal: PortalData) => void;

  upsertRecord: (id: string, record: HospitalRecord) => void;
  deleteRecord: (id: string, recordId: string) => void;
  upsertAppt: (id: string, appt: Appointment) => void;
  deleteAppt: (id: string, apptId: string) => void;
  upsertInvoice: (id: string, invoice: Invoice) => void;
  deleteInvoice: (id: string, invoiceId: string) => void;

  seedForUsers: (ids: string[], sizes?: { records?: number; appts?: number; invoices?: number }) => void;
};

const Ctx = createContext<{ state: AdminState; actions: AdminActions } | null>(null);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { users: [], selectedUserId: null });

  const seedDemo = useCallback((count: number, sizes?: { records?: number; appts?: number; invoices?: number }) => {
    const users = seedUsers(count, sizes);
    dispatch({ type: "seed", users, selectFirst: true });
  }, []);

  const createBlankUser = useCallback(() => {
    const profile = makeProfile({ patientId: makeId("EM") });
    const portal = seedPortalData(profile, { records: 0, appts: 0, invoices: 0 });
    const user: AdminUser = {
      id: profile.patientId,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      status: "Pending",
      createdISO: new Date().toISOString(),
      lastActiveISO: undefined,
      portal,
    };
    dispatch({ type: "createUser", user, select: true });
  }, []);

  const createUserFromProfile = useCallback((p: Partial<PatientProfile>) => {
    const profile = makeProfile({ ...p, patientId: p.patientId || makeId("EM") });
    const portal = seedPortalData(profile);
    const user: AdminUser = {
      id: profile.patientId,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      status: "Active",
      createdISO: new Date().toISOString(),
      lastActiveISO: new Date().toISOString(),
      portal,
    };
    dispatch({ type: "createUser", user, select: true });
  }, []);

  const deleteUser = useCallback((id: string) => dispatch({ type: "deleteUser", id }), []);
  const selectUser = useCallback((id: string | null) => dispatch({ type: "select", id }), []);

  const updateUserMeta = useCallback(
    (id: string, patch: Partial<Pick<AdminUser, "fullName" | "email" | "phone" | "status" | "lastActiveISO">>) => {
      dispatch({ type: "updateUserMeta", id, patch });
    },
    []
  );

  const updateProfile = useCallback((id: string, patch: Partial<PatientProfile>) => {
    dispatch({ type: "updateProfile", id, patch });
  }, []);

  const changePatientId = useCallback((oldId: string, newId: string) => {
    dispatch({ type: "changePatientId", oldId, newId });
  }, []);

  const replacePortal = useCallback((id: string, portal: PortalData) => {
    dispatch({ type: "replacePortal", id, portal });
  }, []);

  const upsertRecord = useCallback((id: string, record: HospitalRecord) => {
    dispatch({ type: "upsertRecord", id, record });
  }, []);
  const deleteRecord = useCallback((id: string, recordId: string) => {
    dispatch({ type: "deleteRecord", id, recordId });
  }, []);

  const upsertAppt = useCallback((id: string, appt: Appointment) => {
    dispatch({ type: "upsertAppt", id, appt });
  }, []);
  const deleteAppt = useCallback((id: string, apptId: string) => {
    dispatch({ type: "deleteAppt", id, apptId });
  }, []);

  const upsertInvoice = useCallback((id: string, invoice: Invoice) => {
    dispatch({ type: "upsertInvoice", id, invoice });
  }, []);
  const deleteInvoice = useCallback((id: string, invoiceId: string) => {
    dispatch({ type: "deleteInvoice", id, invoiceId });
  }, []);

  const seedForUsers = useCallback(
    (ids: string[], sizes?: { records?: number; appts?: number; invoices?: number }) => {
      for (const id of ids) {
        const u = state.users.find((x) => x.id === id);
        if (!u) continue;
        const portal = seedPortalData(u.portal.profile ?? undefined, sizes);
        dispatch({ type: "replacePortal", id, portal });
      }
    },
    [state.users]
  );

  const actions: AdminActions = useMemo(
    () => ({
      seedDemo,
      createBlankUser,
      createUserFromProfile,
      deleteUser,
      selectUser,
      updateUserMeta,
      updateProfile,
      changePatientId,
      replacePortal,
      upsertRecord,
      deleteRecord,
      upsertAppt,
      deleteAppt,
      upsertInvoice,
      deleteInvoice,
      seedForUsers,
    }),
    [
      seedDemo,
      createBlankUser,
      createUserFromProfile,
      deleteUser,
      selectUser,
      updateUserMeta,
      updateProfile,
      changePatientId,
      replacePortal,
      upsertRecord,
      deleteRecord,
      upsertAppt,
      deleteAppt,
      upsertInvoice,
      deleteInvoice,
      seedForUsers,
    ]
  );

  return <Ctx.Provider value={{ state, actions }}>{children}</Ctx.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}

export function useSelectedUser(): AdminUser | null {
  const { state } = useAdminStore();
  return state.selectedUserId ? state.users.find((u) => u.id === state.selectedUserId) ?? null : null;
}
