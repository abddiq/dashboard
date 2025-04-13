import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-600">نظام إدارة الشحنات</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 container mx-auto p-6">
        <Authenticated>
          <Dashboard />
        </Authenticated>
        <Unauthenticated>
          <div className="max-w-md mx-auto mt-20">
            <h1 className="text-3xl font-bold text-center mb-8">تسجيل الدخول للنظام</h1>
            <SignInForm />
          </div>
        </Unauthenticated>
      </main>
    </div>
  );
}

function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<{ _id: Id<"companies">; name: string } | null>(null);
  
  if (selectedCompany) {
    return <CompanyDashboard company={selectedCompany} onBack={() => setSelectedCompany(null)} />;
  }

  return <CompaniesList onSelectCompany={setSelectedCompany} />;
}

function CompaniesList({ onSelectCompany }: { 
  onSelectCompany: (company: { _id: Id<"companies">; name: string }) => void 
}) {
  const companies = useQuery(api.companies.list) || [];
  const createCompany = useMutation(api.companies.create);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCompany(formData);
    setShowForm(false);
    setFormData({ name: "", address: "", phone: "", email: "" });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">الشركات</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة شركة جديدة
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إضافة شركة جديدة</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الشركة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <div key={company._id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
            <p className="text-gray-600 mb-1">{company.address}</p>
            <p className="text-gray-600 mb-1">{company.phone}</p>
            <p className="text-gray-600">{company.email}</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => onSelectCompany({ _id: company._id, name: company.name })}
                className="text-blue-600 hover:text-blue-800"
              >
                إدارة الشحنات
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanyDashboard({ company, onBack }: { 
  company: { _id: Id<"companies">; name: string };
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'drivers'>('deliveries');
  const drivers = useQuery(api.drivers.listByCompany, { companyId: company._id }) || [];
  const deliveries = useQuery(api.deliveries.listByCompany, { companyId: company._id }) || [];
  
  const createDriver = useMutation(api.drivers.create);
  const createDelivery = useMutation(api.deliveries.create);
  const assignDriver = useMutation(api.deliveries.assignDriver);
  const updateDeliveryStatus = useMutation(api.deliveries.updateStatus);

  const [showDriverForm, setShowDriverForm] = useState(false);
  const [driverForm, setDriverForm] = useState({ name: "", phone: "" });

  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: ""
  });

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDriver({
      companyId: company._id,
      ...driverForm
    });
    setShowDriverForm(false);
    setDriverForm({ name: "", phone: "" });
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDelivery({
      companyId: company._id,
      ...deliveryForm
    });
    setShowDeliveryForm(false);
    setDeliveryForm({ customerName: "", customerPhone: "", customerAddress: "" });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">{company.name}</h1>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`py-4 px-6 ${
                activeTab === 'deliveries'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              الشحنات
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-4 px-6 ${
                activeTab === 'drivers'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              السائقين
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'deliveries' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">الشحنات</h2>
            <button
              onClick={() => setShowDeliveryForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              إضافة شحنة جديدة
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العنوان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السائق
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map(delivery => (
                  <tr key={delivery._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{delivery.customerName}</div>
                      <div className="text-sm text-gray-500">{delivery.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{delivery.customerAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {delivery.driverId ? (
                        <div className="text-sm text-gray-900">
                          {drivers.find(d => d._id === delivery.driverId)?.name || 'غير معروف'}
                        </div>
                      ) : (
                        <select
                          className="text-sm border rounded p-1"
                          onChange={(e) => {
                            if (e.target.value) {
                              assignDriver({
                                deliveryId: delivery._id,
                                driverId: e.target.value as Id<"drivers">
                              });
                            }
                          }}
                        >
                          <option value="">اختر سائق</option>
                          {drivers.map(driver => (
                            <option key={driver._id} value={driver._id}>
                              {driver.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="text-sm border rounded p-1"
                        value={delivery.status}
                        onChange={(e) => {
                          updateDeliveryStatus({
                            deliveryId: delivery._id,
                            status: e.target.value
                          });
                        }}
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="assigned">تم التعيين</option>
                        <option value="in-progress">جاري التوصيل</option>
                        <option value="delivered">تم التوصيل</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showDeliveryForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">إضافة شحنة جديدة</h2>
                <form onSubmit={handleCreateDelivery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">اسم العميل</label>
                    <input
                      type="text"
                      value={deliveryForm.customerName}
                      onChange={e => setDeliveryForm({ ...deliveryForm, customerName: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={deliveryForm.customerPhone}
                      onChange={e => setDeliveryForm({ ...deliveryForm, customerPhone: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">العنوان</label>
                    <input
                      type="text"
                      value={deliveryForm.customerAddress}
                      onChange={e => setDeliveryForm({ ...deliveryForm, customerAddress: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeliveryForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      حفظ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">السائقين</h2>
            <button
              onClick={() => setShowDriverForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              إضافة سائق جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map(driver => (
              <div key={driver._id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">{driver.name}</h3>
                <p className="text-gray-600 mb-1">{driver.phone}</p>
                <p className="text-gray-600">
                  الحالة: {driver.status === 'active' ? 'نشط' : 'غير نشط'}
                </p>
              </div>
            ))}
          </div>

          {showDriverForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">إضافة سائق جديد</h2>
                <form onSubmit={handleCreateDriver} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">اسم السائق</label>
                    <input
                      type="text"
                      value={driverForm.name}
                      onChange={e => setDriverForm({ ...driverForm, name: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={driverForm.phone}
                      onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDriverForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      حفظ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
