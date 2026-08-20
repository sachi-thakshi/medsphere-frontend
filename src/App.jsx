import React, { useEffect, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Mail,
  Menu,
  Plus,
  PlusCircle,
  RefreshCw,
  Search,
  Stethoscope,
  X,
} from "lucide-react";

import {
  getDoctors,
  getMedicalServices,
  getAppointments,
  createAppointment,
} from "./services/api";

const navigation = [
  {
    id: "dashboard",
    label: "Overview",
    icon: Layers,
  },
  {
    id: "doctors",
    label: "Doctors",
    icon: Stethoscope,
  },
  {
    id: "services",
    label: "Services",
    icon: Activity,
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: Calendar,
  },
];

const getInitials = (name = "") => {
  const cleanedName = name.replace("Dr. ", "").trim();

  if (!cleanedName) return "DR";

  return cleanedName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    patientName: "",
    patientContact: "",
    doctorRegNo: "",
    serviceCode: "",
    appointmentDateTime: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [docRes, servRes, aptRes] = await Promise.all([
        getDoctors(),
        getMedicalServices(),
        getAppointments(),
      ]);

      setDoctors(docRes.data || []);
      setServices(servRes.data || []);
      setAppointments(aptRes.data || []);
    } catch (err) {
      console.error(err);

      setError(
        "We couldn't connect to the MedSphere services. Please verify the backend services and load balancer."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const selectedDoc = doctors.find(
    (doctor) => doctor.doctorRegNo === form.doctorRegNo
  );

  const selectedServ = services.find(
    (service) => service.code === form.serviceCode
  );

  const calculatedFee =
    (selectedDoc?.consultationFee || 0) +
    (selectedServ?.price || 0);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setBookingSuccess(null);

    const payload = {
      ...form,
      totalFee: calculatedFee,

      appointmentDateTime: form.appointmentDateTime.includes(":00")
        ? form.appointmentDateTime
        : `${form.appointmentDateTime}:00`,
    };

    try {
      const response = await createAppointment(payload);

      setBookingSuccess(
        `Appointment confirmed. Reference: ${
          response.data.appointmentNumber || "Success"
        }`
      );

      setForm({
        patientName: "",
        patientContact: "",
        doctorRegNo: "",
        serviceCode: "",
        appointmentDateTime: "",
      });

      await fetchAllData();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to create the appointment. Please verify the patient and appointment details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setSearch("");
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const value = search.toLowerCase();

    return (
      doctor.fullName?.toLowerCase().includes(value) ||
      doctor.specialization?.toLowerCase().includes(value) ||
      doctor.doctorRegNo?.toLowerCase().includes(value)
    );
  });

  const filteredServices = services.filter((service) => {
    const value = search.toLowerCase();

    return (
      service.name?.toLowerCase().includes(value) ||
      service.code?.toLowerCase().includes(value) ||
      service.department?.toLowerCase().includes(value)
    );
  });

  const filteredAppointments = appointments.filter((appointment) => {
    const value = search.toLowerCase();

    return (
      appointment.patientName?.toLowerCase().includes(value) ||
      appointment.appointmentNumber?.toLowerCase().includes(value) ||
      appointment.serviceCode?.toLowerCase().includes(value) ||
      appointment.doctorRegNo?.toLowerCase().includes(value)
    );
  });

  const getPageTitle = () => {
    switch (activeTab) {
      case "doctors":
        return {
          eyebrow: "Medical network",
          title: "Doctors",
          description:
            "View registered medical professionals and specialist information.",
        };

      case "services":
        return {
          eyebrow: "Healthcare services",
          title: "Clinical Services",
          description:
            "Explore diagnostic, consultation and clinical services.",
        };

      case "appointments":
        return {
          eyebrow: "Patient care",
          title: "Appointments",
          description:
            "Track patient appointments, schedules and payment information.",
        };

      case "book":
        return {
          eyebrow: "New appointment",
          title: "Book a Visit",
          description:
            "Schedule a consultation with a medical professional.",
        };

      default:
        return {
          eyebrow: "Healthcare operations",
          title: "Dashboard",
          description:
            "Monitor doctors, services and patient appointments in one place.",
        };
    }
  };

  const page = getPageTitle();

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => changeTab("dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-black text-white shadow-lg shadow-black/10">
              <Activity
                className="h-5 w-5 text-blue-400"
                strokeWidth={2.4}
              />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-extrabold tracking-[-0.04em] text-black">
                  MedSphere
                </span>

                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Healthcare Cloud
              </p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center rounded-2xl border border-slate-200/80 bg-slate-50 p-1.5 lg:flex">
            {navigation.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                    active
                      ? "bg-black text-white shadow-md shadow-black/10"
                      : "text-slate-500 hover:bg-white hover:text-black"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      active ? "text-blue-400" : ""
                    }`}
                  />

                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Header action */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-black sm:flex"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={() => changeTab("book")}
              className="hidden items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 sm:flex"
            >
              <Plus className="h-4 w-4" />

              Book appointment
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-black lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white p-4 lg:hidden">
            <div className="space-y-1">
              {navigation.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => changeTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                      activeTab === tab.id
                        ? "bg-black text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />

                    {tab.label}
                  </button>
                );
              })}

              <button
                onClick={() => changeTab("book")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
              >
                <PlusCircle className="h-4 w-4" />
                Book appointment
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          PAGE
      ====================================================== */}

      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {/* Page Header */}
        <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-6 bg-blue-600" />

              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">
                {page.eyebrow}
              </p>
            </div>

            <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-black sm:text-[38px]">
              {page.title}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {page.description}
            </p>
          </div>

          {activeTab !== "book" && (
            <button
              onClick={() => changeTab("book")}
              className="group flex w-fit items-center gap-3 rounded-2xl bg-black px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-900"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <Plus className="h-4 w-4" />
              </div>

              New appointment

              <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-white" />
            </button>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-red-950">
                Connection error
              </p>

              <p className="mt-0.5 text-xs leading-5 text-red-700">
                {error}
              </p>
            </div>

            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =====================================================
            LOADER
        ====================================================== */}

        {loading ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />

              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" />
            </div>

            <p className="mt-5 text-sm font-bold text-black">
              Connecting to MedSphere
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Loading healthcare services...
            </p>
          </div>
        ) : (
          <>
            {/* =====================================================
                DASHBOARD
            ====================================================== */}

            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-[30px] bg-black px-6 py-8 text-white sm:px-9 lg:px-10 lg:py-10">
                  <div className="absolute -right-20 -top-32 h-[380px] w-[380px] rounded-full bg-blue-600/30 blur-[100px]" />

                  <div className="absolute bottom-[-160px] right-[20%] h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-[100px]" />

                  <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-blue-400" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                          Cloud network operational
                        </span>
                      </div>

                      <h2 className="max-w-2xl text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                        Healthcare management,
                        <span className="text-blue-400">
                          {" "}
                          simplified.
                        </span>
                      </h2>

                      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                        Manage healthcare professionals, clinical
                        services and patient appointments through one
                        secure cloud platform.
                      </p>
                    </div>

                    <button
                      onClick={() => changeTab("book")}
                      className="flex w-fit items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-extrabold text-black transition hover:bg-blue-50"
                    >
                      Schedule patient
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <StatCard
                    title="Active Doctors"
                    value={doctors.length}
                    description="Registered specialists"
                    icon={Stethoscope}
                  />

                  <StatCard
                    title="Clinical Services"
                    value={services.length}
                    description="Available treatments"
                    icon={Activity}
                  />

                  <StatCard
                    title="Appointments"
                    value={appointments.length}
                    description="Total scheduled visits"
                    icon={Calendar}
                  />
                </div>

                {/* Recent */}
                <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-soft">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                    <div>
                      <h2 className="font-extrabold tracking-[-0.02em] text-black">
                        Recent appointments
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Latest patient visit activity
                      </p>
                    </div>

                    <button
                      onClick={() => changeTab("appointments")}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      View all
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {appointments.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="No appointments yet"
                      description="Patient appointments will appear here."
                    />
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {appointments.slice(0, 5).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-extrabold text-blue-700">
                              {getInitials(appointment.patientName)}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-black">
                                {appointment.patientName}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                                <span>
                                  {appointment.appointmentNumber}
                                </span>

                                <span>•</span>

                                <span>{appointment.serviceCode}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-5 sm:justify-end">
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-extrabold text-black">
                                LKR{" "}
                                {appointment.totalFee?.toLocaleString()}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {formatDate(
                                  appointment.appointmentDateTime
                                )}
                              </p>
                            </div>

                            <StatusBadge status={appointment.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* =====================================================
                DOCTORS
            ====================================================== */}

            {activeTab === "doctors" && (
              <div className="space-y-5">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search doctor, specialization or registration number..."
                  count={filteredDoctors.length}
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredDoctors.map((doctor) => (
                    <article
                      key={doctor.id}
                      className="group rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-card"
                    >
                      <div className="flex items-start justify-between">
                        {/* Doctor Image or Initials Fallback */}
                        {doctor.profileImageUrl ? (
                          <img
                            src={doctor.profileImageUrl}
                            alt={doctor.fullName}
                            className="h-14 w-14 rounded-2xl border border-slate-100 object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              // Fallback in case image fails to load
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}

                        <div
                          className={`h-14 w-14 items-center justify-center rounded-2xl bg-black text-sm font-extrabold text-white ${
                            doctor.profileImageUrl ? "hidden" : "flex"
                          }`}
                        >
                          {getInitials(doctor.fullName)}
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-5">
                        <h3 className="text-lg font-extrabold tracking-[-0.03em] text-black">
                          {doctor.fullName}
                        </h3>

                        <span className="mt-2 inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                          {doctor.specialization}
                        </span>
                      </div>

                      <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                        <InfoRow
                          label="Registration"
                          value={doctor.doctorRegNo}
                          mono
                        />

                        <InfoRow
                          label="Consultation"
                          value={`LKR ${doctor.consultationFee?.toLocaleString()}`}
                        />

                        <div className="flex min-w-0 items-center gap-2.5 pt-1 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          <span className="truncate">
                            {doctor.email || "No email available"}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {filteredDoctors.length === 0 && (
                  <EmptyState
                    icon={Stethoscope}
                    title="No doctors found"
                    description="Try a different search keyword."
                  />
                )}
              </div>
            )}
            

            {/* =====================================================
                SERVICES
            ====================================================== */}

            {activeTab === "services" && (
              <div className="space-y-5">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search service, code or department..."
                  count={filteredServices.length}
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredServices.map((service) => (
                    <article
                      key={service.id}
                      className="group flex min-h-[250px] flex-col justify-between rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-card"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-lg bg-black px-2.5 py-1.5 font-mono text-[10px] font-bold text-white">
                            {service.code}
                          </span>

                          <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700">
                            {service.department}
                          </span>
                        </div>

                        <div className="mt-6">
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <Activity className="h-4 w-4" />
                          </div>

                          <h3 className="text-lg font-extrabold tracking-[-0.03em] text-black">
                            {service.name}
                          </h3>

                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="h-3.5 w-3.5" />

                            {service.durationMinutes} minutes
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Service price
                          </p>

                          <p className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-black">
                            LKR {service.price?.toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setForm({
                              ...form,
                              serviceCode: service.code,
                            });

                            changeTab("book");
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-black transition group-hover:bg-blue-600 group-hover:text-white"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {filteredServices.length === 0 && (
                  <EmptyState
                    icon={Activity}
                    title="No services found"
                    description="Try a different search keyword."
                  />
                )}
              </div>
            )}

            {/* =====================================================
                APPOINTMENTS
            ====================================================== */}

            {activeTab === "appointments" && (
              <div className="space-y-5">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search patient, reference, doctor or service..."
                  count={filteredAppointments.length}
                />

                <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-soft">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          {[
                            "Reference",
                            "Patient",
                            "Doctor",
                            "Service",
                            "Schedule",
                            "Total",
                            "Status",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredAppointments.map((appointment) => (
                          <tr
                            key={appointment.id}
                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                          >
                            <td className="px-6 py-5">
                              <span className="font-mono text-[11px] font-bold text-blue-700">
                                {appointment.appointmentNumber}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-[10px] font-bold text-white">
                                  {getInitials(
                                    appointment.patientName
                                  )}
                                </div>

                                <div>
                                  <p className="text-xs font-bold text-black">
                                    {appointment.patientName}
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    {appointment.patientContact}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5 font-mono text-[11px] font-medium text-slate-600">
                              {appointment.doctorRegNo}
                            </td>

                            <td className="px-6 py-5">
                              <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700">
                                {appointment.serviceCode}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-xs font-medium text-slate-500">
                              {formatDate(
                                appointment.appointmentDateTime
                              )}
                            </td>

                            <td className="px-6 py-5 text-xs font-extrabold text-black">
                              LKR{" "}
                              {appointment.totalFee?.toLocaleString()}
                            </td>

                            <td className="px-6 py-5">
                              <StatusBadge
                                status={appointment.status}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredAppointments.length === 0 && (
                    <EmptyState
                      icon={Calendar}
                      title="No appointments found"
                      description="No appointments match your search."
                    />
                  )}
                </div>
              </div>
            )}

            {/* =====================================================
                BOOK
            ====================================================== */}

            {activeTab === "book" && (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
                {/* Form */}
                <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-soft sm:p-8">
                  <div className="mb-8 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <Calendar className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-xl font-extrabold tracking-[-0.03em] text-black">
                        Patient information
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Enter patient information and choose the required
                        healthcare service.
                      </p>
                    </div>
                  </div>

                  {bookingSuccess && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                      <div>
                        <p className="text-sm font-bold text-blue-950">
                          Booking successful
                        </p>

                        <p className="mt-1 text-xs text-blue-700">
                          {bookingSuccess}
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleBookingSubmit}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField
                        label="Patient full name"
                        required
                      >
                        <input
                          type="text"
                          required
                          value={form.patientName}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              patientName: e.target.value,
                            })
                          }
                          className="form-input-modern"
                          placeholder="Enter full name"
                        />
                      </FormField>

                      <FormField
                        label="Contact number"
                        required
                      >
                        <input
                          type="tel"
                          required
                          value={form.patientContact}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              patientContact: e.target.value,
                            })
                          }
                          className="form-input-modern"
                          placeholder="+94 77 123 4567"
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField
                        label="Medical professional"
                        required
                      >
                        <select
                          required
                          value={form.doctorRegNo}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              doctorRegNo: e.target.value,
                            })
                          }
                          className="form-input-modern"
                        >
                          <option value="">Select doctor</option>

                          {doctors.map((doctor) => (
                            <option
                              key={doctor.id}
                              value={doctor.doctorRegNo}
                            >
                              {doctor.fullName} —{" "}
                              {doctor.specialization}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField
                        label="Clinical service"
                        required
                      >
                        <select
                          required
                          value={form.serviceCode}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              serviceCode: e.target.value,
                            })
                          }
                          className="form-input-modern"
                        >
                          <option value="">
                            Select healthcare service
                          </option>

                          {services.map((service) => (
                            <option
                              key={service.id}
                              value={service.code}
                            >
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <FormField
                      label="Appointment date & time"
                      required
                    >
                      <input
                        type="datetime-local"
                        required
                        value={form.appointmentDateTime}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            appointmentDateTime:
                              e.target.value,
                          })
                        }
                        className="form-input-modern"
                      />
                    </FormField>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Confirming appointment...
                          </>
                        ) : (
                          <>
                            Confirm appointment
                            <ArrowUpRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Summary */}
                <aside className="h-fit overflow-hidden rounded-[26px] bg-black text-white shadow-xl shadow-black/10 xl:sticky xl:top-[105px]">
                  <div className="border-b border-white/10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-400">
                          Booking summary
                        </p>

                        <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em]">
                          Estimated cost
                        </h3>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                        <Activity className="h-5 w-5 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-6">
                    <SummaryRow
                      label="Doctor"
                      value={selectedDoc?.fullName || "Not selected"}
                    />

                    <SummaryRow
                      label="Specialization"
                      value={
                        selectedDoc?.specialization || "—"
                      }
                    />

                    <SummaryRow
                      label="Service"
                      value={selectedServ?.name || "Not selected"}
                    />

                    <div className="h-px bg-white/10" />

                    <div className="space-y-3">
                      <PriceRow
                        label="Consultation"
                        value={
                          selectedDoc?.consultationFee || 0
                        }
                      />

                      <PriceRow
                        label="Clinical service"
                        value={selectedServ?.price || 0}
                      />
                    </div>

                    <div className="rounded-2xl bg-blue-600 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-blue-100">
                        Total estimated fee
                      </p>

                      <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
                        LKR {calculatedFee.toLocaleString()}
                      </p>
                    </div>

                    <p className="text-[10px] leading-5 text-slate-500">
                      The displayed amount is based on the selected
                      doctor's consultation fee and clinical service
                      charge.
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        .form-input-modern {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-input-modern:hover {
          border-color: #cbd5e1;
        }

        .form-input-modern:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .form-input-modern::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <article className="group rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-soft transition-all duration-300 hover:border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>

        <ArrowUpRight className="h-4 w-4 text-slate-300" />
      </div>

      <div className="mt-7">
        <p className="text-3xl font-extrabold tracking-[-0.05em] text-black">
          {value}
        </p>

        <p className="mt-2 text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder,
  count,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200/80 bg-white p-3 shadow-soft sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[14px] border-0 bg-slate-50 py-3 pl-11 pr-4 text-xs font-medium text-black outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
        />
      </div>

      <div className="flex items-center justify-between px-2 sm:justify-end sm:gap-2">
        <span className="text-[11px] font-medium text-slate-400">
          Results
        </span>

        <span className="rounded-lg bg-black px-2.5 py-1 text-[11px] font-extrabold text-white">
          {count}
        </span>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-slate-400">{label}</span>

      <span
        className={`text-right font-bold text-slate-800 ${
          mono ? "font-mono text-[11px]" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase();

  const successful =
    normalized === "confirmed" ||
    normalized === "completed" ||
    normalized === "success";

  if (successful) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

        {status || "Confirmed"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

      {status || "Pending"}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-sm font-extrabold text-black">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-extrabold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-blue-600">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="text-xs font-bold text-white">
        LKR {value.toLocaleString()}
      </span>
    </div>
  );
}