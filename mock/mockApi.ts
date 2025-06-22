import { mockDoctors, mockPatients, mockOrders, MockOrder } from './mockData';
import { findNearbyDoctors } from './geo';

export const mockAPI = {
  getNearbyDoctors: (patientId: string, radius = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patient = mockPatients.find((p) => p.patientId === patientId);
        if (!patient) return resolve([]);
        const doctors = findNearbyDoctors(mockDoctors, patient.coordinates, radius);
        resolve(doctors);
      }, 800);
    });
  },

  createOrder: (orderData: Omit<MockOrder, 'orderId' | 'status'>) => {
    return new Promise<MockOrder>((resolve) => {
      setTimeout(() => {
        const newOrder: MockOrder = {
          orderId: `order_${Date.now()}`,
          ...orderData,
          status: 'pending',
          scheduledDate: new Date(orderData.scheduledDate),
        };
        mockOrders.push(newOrder);
        resolve(newOrder);
      }, 600);
    });
  },

  acceptOrder: (orderId: string, doctorId: string) => {
    return new Promise<MockOrder | undefined>((resolve) => {
      setTimeout(() => {
        const order = mockOrders.find((o) => o.orderId === orderId);
        if (order) {
          order.status = 'accepted';
          order.doctorId = doctorId;
        }
        resolve(order);
      }, 400);
    });
  },
};
