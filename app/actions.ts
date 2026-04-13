'use server';

import prisma from '../src/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createFlexibleTask(formData: FormData) {
  const title = formData.get('title') as string;
  const duration = parseInt(formData.get('duration') as string, 10);
  const deadlineStr = formData.get('deadline') as string;
  const priority = formData.get('priority') as string;
  const subjectId = formData.get('subjectId') as string;

  if (!title || !duration || !deadlineStr || !priority || !subjectId) {
    throw new Error('Bitte alle Felder ausfüllen.');
  }

  const deadline = new Date(deadlineStr);
  deadline.setHours(23, 59, 59, 999);

  await prisma.flexibleTask.create({
    data: {
      title,
      duration,
      deadline,
      priority,
      subjectId: subjectId === 'none' ? null : subjectId,
      minChunk: 45,
      maxChunk: 90,
    },
  });

  revalidatePath('/');
}

export async function updateFlexibleTask(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const duration = parseInt(formData.get('duration') as string, 10);
  const deadlineStr = formData.get('deadline') as string;
  const priority = formData.get('priority') as string;
  const subjectId = formData.get('subjectId') as string;

  if (!title || !duration || !deadlineStr || !priority || !subjectId) {
    throw new Error('Bitte alle Felder ausfüllen.');
  }

  const deadline = new Date(deadlineStr);
  deadline.setHours(23, 59, 59, 999);

  await prisma.flexibleTask.update({
    where: { id },
    data: {
      title,
      duration,
      deadline,
      priority,
      subjectId: subjectId === 'none' ? null : subjectId,
    },
  });

  revalidatePath('/');
}

export async function deleteFlexibleTask(id: string) {
  await prisma.flexibleTask.delete({
    where: { id },
  });
  revalidatePath('/');
}

export async function createStaticEvent(formData: FormData) {
  const title = formData.get('title') as string;
  const dateStr = formData.get('date') as string; 
  const startTimeStr = formData.get('startTime') as string; 
  const endTimeStr = formData.get('endTime') as string; 
  const requiresTravelTime = formData.get('requiresTravelTime') === 'true';
  const subjectId = formData.get('subjectId') as string;

  if (!title || !dateStr || !startTimeStr || !endTimeStr) {
    throw new Error('Bitte alle Felder ausfüllen.');
  }

  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const startObj = new Date(dateStr);
  startObj.setHours(startH, startM, 0, 0);

  const endObj = new Date(dateStr);
  endObj.setHours(endH, endM, 0, 0);

  await prisma.staticEvent.create({
    data: {
      title,
      startTime: startObj,
      endTime: endObj,
      isStatic: true,
      requiresTravelTime,
      subjectId: subjectId && subjectId !== 'none' ? subjectId : null,
    },
  });

  revalidatePath('/');
}

export async function updateStaticEvent(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const dateStr = formData.get('date') as string; 
  const startTimeStr = formData.get('startTime') as string; 
  const endTimeStr = formData.get('endTime') as string; 
  const requiresTravelTime = formData.get('requiresTravelTime') === 'true';
  const subjectId = formData.get('subjectId') as string;

  if (!title || !dateStr || !startTimeStr || !endTimeStr) {
    throw new Error('Bitte alle Felder ausfüllen.');
  }

  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const startObj = new Date(dateStr);
  startObj.setHours(startH, startM, 0, 0);

  const endObj = new Date(dateStr);
  endObj.setHours(endH, endM, 0, 0);

  await prisma.staticEvent.update({
    where: { id },
    data: {
      title,
      startTime: startObj,
      endTime: endObj,
      requiresTravelTime,
      subjectId: subjectId && subjectId !== 'none' ? subjectId : null,
    },
  });

  revalidatePath('/');
}

export async function deleteStaticEvent(id: string) {
  await prisma.staticEvent.delete({
    where: { id },
  });
  revalidatePath('/');
}
