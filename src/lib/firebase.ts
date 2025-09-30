import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Types for law firms
export interface LawFirm {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  website?: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviews_count: number;
  specialties: string[];
  hours: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Types for law firm applications
export interface LawFirmApplication {
  id: string;
  firm_name: string;
  contact_person_name: string;
  contact_person_title: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  website?: string;
  years_in_business: string;
  number_of_attorneys: string;
  specialties: string[];
  services_offered: string[];
  average_closing_time: string;
  business_hours: string;
  weekend_availability: boolean;
  emergency_services: boolean;
  additional_info?: string;
  terms_accepted: boolean;
  marketing_consent: boolean;
  status: 'pending' | 'approved' | 'denied';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Law firm service functions
export const lawFirmService = {
  // Get all active law firms
  async getActiveLawFirms(): Promise<LawFirm[]> {
    try {
      const q = query(
        collection(db, 'law_firms'),
        where('is_active', '==', true),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      })) as LawFirm[];
    } catch (error) {
      console.error('Error fetching law firms:', error);
      throw error;
    }
  },

  // Get all law firms (for admin)
  async getAllLawFirms(): Promise<LawFirm[]> {
    try {
      const q = query(collection(db, 'law_firms'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      })) as LawFirm[];
    } catch (error) {
      console.error('Error fetching all law firms:', error);
      throw error;
    }
  },

  // Get law firm by ID
  async getLawFirmById(id: string): Promise<LawFirm | null> {
    try {
      const docRef = doc(db, 'law_firms', id);
      const docSnap = await getDocs(query(collection(db, 'law_firms'), where('__name__', '==', id)));
      
      if (docSnap.empty) {
        return null;
      }
      
      const docData = docSnap.docs[0];
      return {
        id: docData.id,
        ...docData.data(),
        created_at: docData.data().created_at?.toDate() || new Date(),
        updated_at: docData.data().updated_at?.toDate() || new Date()
      } as LawFirm;
    } catch (error) {
      console.error('Error fetching law firm:', error);
      throw error;
    }
  },

  // Create new law firm
  async createLawFirm(lawFirm: Omit<LawFirm, 'id' | 'created_at' | 'updated_at'>): Promise<LawFirm> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'law_firms'), {
        ...lawFirm,
        created_at: now,
        updated_at: now
      });

      return {
        id: docRef.id,
        ...lawFirm,
        created_at: now.toDate(),
        updated_at: now.toDate()
      };
    } catch (error) {
      console.error('Error creating law firm:', error);
      throw error;
    }
  },

  // Update law firm
  async updateLawFirm(id: string, updates: Partial<Omit<LawFirm, 'id' | 'created_at' | 'updated_at'>>): Promise<LawFirm> {
    try {
      const docRef = doc(db, 'law_firms', id);
      const now = Timestamp.now();
      
      await updateDoc(docRef, {
        ...updates,
        updated_at: now
      });

      // Get the updated document
      const updatedDoc = await this.getLawFirmById(id);
      if (!updatedDoc) {
        throw new Error('Failed to retrieve updated law firm');
      }

      return updatedDoc;
    } catch (error) {
      console.error('Error updating law firm:', error);
      throw error;
    }
  },

  // Delete law firm (soft delete by setting is_active to false)
  async deleteLawFirm(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'law_firms', id);
      const now = Timestamp.now();
      
      await updateDoc(docRef, {
        is_active: false,
        updated_at: now
      });
    } catch (error) {
      console.error('Error deleting law firm:', error);
      throw error;
    }
  },

  // Hard delete law firm (permanent removal)
  async permanentlyDeleteLawFirm(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'law_firms', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error permanently deleting law firm:', error);
      throw error;
    }
  }
};

// Law firm application service functions
export const lawFirmApplicationService = {
  // Submit new application
  async submitApplication(applicationData: Omit<LawFirmApplication, 'id' | 'status' | 'admin_notes' | 'reviewed_by' | 'reviewed_at' | 'created_at' | 'updated_at'>): Promise<LawFirmApplication> {
    console.log('Attempting to submit application to Firestore:', applicationData);
    
    // Validate required fields
    const requiredFields = ['firm_name', 'contact_person_name', 'contact_person_title', 'street_address', 'city', 'state', 'zip_code', 'phone', 'email'];
    for (const field of requiredFields) {
      if (!applicationData[field as keyof typeof applicationData]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'law_firm_applications'), {
        ...applicationData,
        status: 'pending',
        created_at: now,
        updated_at: now
      });

      const result = {
        id: docRef.id,
        ...applicationData,
        status: 'pending' as const,
        created_at: now.toDate(),
        updated_at: now.toDate()
      };

      console.log('Application submitted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error submitting application:', error);
      console.error('Application data that failed:', applicationData);
      throw error;
    }
  },

  // Get all applications (for admin)
  async getAllApplications(): Promise<LawFirmApplication[]> {
    try {
      const q = query(collection(db, 'law_firm_applications'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
        reviewed_at: doc.data().reviewed_at?.toDate()
      })) as LawFirmApplication[];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Get applications by status
  async getApplicationsByStatus(status: 'pending' | 'approved' | 'denied'): Promise<LawFirmApplication[]> {
    try {
      const q = query(
        collection(db, 'law_firm_applications'),
        where('status', '==', status),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
        reviewed_at: doc.data().reviewed_at?.toDate()
      })) as LawFirmApplication[];
    } catch (error) {
      console.error('Error fetching applications by status:', error);
      throw error;
    }
  },

  // Update application status
  async updateApplicationStatus(
    id: string, 
    status: 'approved' | 'denied', 
    adminNotes?: string, 
    reviewedBy?: string
  ): Promise<LawFirmApplication> {
    try {
      const docRef = doc(db, 'law_firm_applications', id);
      const now = Timestamp.now();
      
      await updateDoc(docRef, {
        status,
        admin_notes: adminNotes,
        reviewed_by: reviewedBy,
        reviewed_at: now,
        updated_at: now
      });

      // Get the updated document
      const q = query(collection(db, 'law_firm_applications'), where('__name__', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Application not found after update');
      }

      const docData = querySnapshot.docs[0];
      return {
        id: docData.id,
        ...docData.data(),
        created_at: docData.data().created_at?.toDate() || new Date(),
        updated_at: docData.data().updated_at?.toDate() || new Date(),
        reviewed_at: docData.data().reviewed_at?.toDate()
      } as LawFirmApplication;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // Approve application and create law firm
  async approveApplicationAndCreateFirm(applicationId: string, adminNotes?: string, reviewedBy?: string): Promise<{ application: LawFirmApplication; lawFirm: LawFirm }> {
    try {
      // First get the application
      const q = query(collection(db, 'law_firm_applications'), where('__name__', '==', applicationId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Application not found');
      }

      const applicationDoc = querySnapshot.docs[0];
      const application = {
        id: applicationDoc.id,
        ...applicationDoc.data(),
        created_at: applicationDoc.data().created_at?.toDate() || new Date(),
        updated_at: applicationDoc.data().updated_at?.toDate() || new Date(),
        reviewed_at: applicationDoc.data().reviewed_at?.toDate()
      } as LawFirmApplication;

      // Geocode the address to get coordinates
      let latitude = 0;
      let longitude = 0;
      
      try {
        const address = `${application.street_address}, ${application.city}, ${application.state} ${application.zip_code}`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          latitude = parseFloat(data[0].lat);
          longitude = parseFloat(data[0].lon);
        }
      } catch (error) {
        console.warn('Could not geocode address, using default coordinates:', error);
      }

      // Create the law firm
      const lawFirmData = {
        name: application.firm_name,
        street_address: application.street_address,
        city: application.city,
        state: application.state,
        zip_code: application.zip_code,
        phone: application.phone,
        email: application.email,
        website: application.website || '',
        latitude,
        longitude,
        rating: 0,
        reviews_count: 0,
        specialties: application.specialties,
        hours: application.business_hours,
        is_active: true
      };

      const createdFirm = await lawFirmService.createLawFirm(lawFirmData);

      // Update application status
      const updatedApplication = await this.updateApplicationStatus(applicationId, 'approved', adminNotes, reviewedBy);

      return {
        application: updatedApplication,
        lawFirm: createdFirm
      };
    } catch (error) {
      console.error('Error approving application and creating firm:', error);
      throw error;
    }
  },

  // Delete application
  async deleteApplication(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'law_firm_applications', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }
};